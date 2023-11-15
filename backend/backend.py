from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import pandas as pd
import random
from geopy.geocoders import Nominatim
from itertools import combinations
import random
from shapely.geometry import Polygon, Point
import math
import pandas as pd
import numpy as np
import itertools
import geopandas as gpd

app = Flask(__name__)
CORS(app)

# Mock data for ISPs
isps = ['ISP1', 'ISP2', 'ISP3']

# Mock data for peering results
peering_data = {
    ('ISP1', 'ISP2'): {
        'contracts': [1, 2, 3],
        'requestor': [0.8, 0.7, 0.9],
        'candidate': [0.6, 0.5, 0.7],
        'combined': [0.7, 0.6, 0.8]
    },
    ('ISP1', 'ISP3'): {
        'contracts': [1, 2, 3],
        'requestor': [0.2, 0.7, 0.9],
        'candidate': [0.8, 0.5, 0.7],
        'combined': [0.7, 0.6, 0.8]
    }
}


isp1Coordinates = [
    [26.8467, 80.9462],
    [25.3176, 82.9739],
    [28.6139, 77.209],
]

isp2Coordinates = [
    [26.8467, 80.9462],
    [27.1767, 78.0081],
    [25.3176, 82.9739],
]

willingness_score = 0.91
affinity_score = 0.62
location = "Pune"


#ACTUAL CODE


ISP_data = pd.read_excel("isp_peering_data.xlsx")


def generate_ppc(PPP):
    all_ppc = []
    for r in range(1, len(PPP) + 1):
        combinations = itertools.combinations(PPP, r)
        for combo in combinations:
            ppc = {"requester": list(combo), "candidate": list(set(PPP) - set(combo))}
            all_ppc.append(ppc)
    return all_ppc

def calculate_traffic_matrix(ppc, traffic_characteristics, populations):
    tm = {}
    total_traffic = 10000
    for contract_id, contract in enumerate(ppc):

        requester_points = contract["requester"]
        candidate_points = contract["candidate"]
        requester_traffic = sum(populations[point] for point in requester_points)
        candidate_traffic = sum(populations[point] for point in candidate_points)
        
        tm[contract_id] = gravity_tm([requester_traffic, candidate_traffic], total_traffic)
    return tm

def gravity_tm(populations, total_traffic):
    if not isinstance(populations, np.ndarray):
        populations = np.array(populations)
    if populations.ndim != 1:
        raise Exception('Expected populations to be a 1-d numpy array')
    num_nodes = populations.size
    res = np.zeros((num_nodes, num_nodes))
    denom = populations.sum() ** 2
    for i in range(num_nodes):
        for j in range(num_nodes):
            res[i, j] = (populations[i] * populations[j] / denom) * total_traffic
    res = res[:, :, np.newaxis]
    return res

def get_lat_long_pairs(isp_name, df):
    filtered_df = df[df['ISP Name'] == isp_name]
    lat_long_pairs = list(zip(filtered_df['Latitude'], filtered_df['Longitude']))
    return lat_long_pairs

def calculate_population(polygon):
    population_density = 20
    grid_cells = gpd.GeoDataFrame(geometry=[polygon])
    grid_cells['population'] = grid_cells.area * population_density
    return grid_cells['population'].sum()


@app.route('/api/isps', methods=['GET'])
def get_isps():
    excel_file_path = 'isp_peering_data.xlsx'

    # Specify the name of the column containing ISPs
    isp_column_name = 'ISP Name'

    try:

        # Extract the column with ISPs
        isps = ISP_data[isp_column_name].unique().tolist()

        return jsonify({'isps': isps})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/peering', methods=['POST'])
def calculate_scores():
    try:
        isp_req = request.json.get('requestorISP')
        isp_can = request.json.get('candidateISP')

        isp_req_data = ISP_data[ISP_data['ISP Name'] == isp_req]
        isp_can_data = ISP_data[ISP_data['ISP Name'] == isp_can]

        # Create lists of latitude and longitude points for each ISP.
        isp_req_coordinates = isp_req_data[['Latitude', 'Longitude']].values.tolist()
        isp_can_coordinates = isp_can_data[['Latitude', 'Longitude']].values.tolist()


        data = ISP_data[(ISP_data["ISP Name"] == isp_req) | (ISP_data["ISP Name"] == isp_can)]

        PPP = data['Peering Point'].tolist()

        possible_peering_contracts = generate_ppc(PPP)

        total_traffic = 10000

        traffic_characteristics = {
            "Heavy Inbound": "10 Tbps+",
            "Heavy Outbound": "1 Tbps",
            "Inbound": "500-1000 Gbps",
            "Balanced": "300-500 Gbps",
            "Mostly Inbound": "Other values",
            "Mostly Outbound": "Other values",
        }

        populations = {}

        populations = data.set_index('Peering Point')['Traffic Population'].to_dict()

        # Calculate the traffic matrix
        traffic_matrix = calculate_traffic_matrix(possible_peering_contracts, traffic_characteristics, populations)


        ranked_ppc_requestor = sorted(possible_peering_contracts, key=lambda ppc: -traffic_matrix[possible_peering_contracts.index(ppc)][0][0])

        # Rank PPC based on candidate's outbound traffic matrix
        ranked_ppc_candidate = sorted(possible_peering_contracts, key=lambda ppc: -traffic_matrix[possible_peering_contracts.index(ppc)][1][0])

        # Assign Contract IDs and Requestor Ranks
        for idx, ppc in enumerate(ranked_ppc_requestor):
            ppc["contract_id"] = idx + 1
            ppc["requestor_rank"] = idx + 1
            
        available_ranks = list(range(1, len(ranked_ppc_candidate) + 1))
        random.shuffle(available_ranks)

        # Assign ranks to the candidates
        for ppc in ranked_ppc_candidate:
            ppc["candidate_rank"] = available_ranks.pop()

        # Calculate willingness scores for both requestor and candidate
        total_ppc = len(possible_peering_contracts)
        willingness_scores_requestor = {ppc["contract_id"]: 1 - (ppc["requestor_rank"] - 1) / total_ppc for ppc in possible_peering_contracts}
        willingness_scores_candidate = {ppc["contract_id"]: 1 - (ppc["candidate_rank"] - 1) / total_ppc for ppc in possible_peering_contracts}

        # Create a DataFrame to store the calculated parameters
        data_willing = {
            'Willingness_Scores_Requestor': willingness_scores_requestor.values(),
            'Willingness_Scores_Candidate': willingness_scores_candidate.values(),
            'Combine_willingness_score': [((w1 * w2) ** 0.5) for w1, w2 in zip(willingness_scores_requestor.values(), willingness_scores_candidate.values())],
            'Decision_willingness_score': [w * ((w1 * w2) ** 0.5) for w, w1, w2 in zip(willingness_scores_requestor.values(), willingness_scores_requestor.values(), willingness_scores_candidate.values())],
            "peering_location": [ppc["requester"][0] for ppc in possible_peering_contracts]

        }

        profile_df = pd.DataFrame(data_willing)

        profile_df['Order'] = profile_df['Decision_willingness_score'].rank(ascending=False).astype(int)


        isp1_points = get_lat_long_pairs(isp_req, data)
        isp2_points = get_lat_long_pairs(isp_can, data)

        isp1_polygon = Polygon(isp1_points)
        isp2_polygon = Polygon(isp2_points)

        # Simplify and validate the polygons
        isp1_polygon = isp1_polygon.simplify(0).buffer(0)  # Simplify and remove self-intersections
        isp2_polygon = isp2_polygon.simplify(0).buffer(0)  # Simplify and remove self-intersections

        # Check if the polygons are valid
        if not isp1_polygon.is_valid or not isp2_polygon.is_valid:
            raise ValueError("Invalid polygons after simplification.")

        # Calculate the total population for each ISP's coverage area
        cell_size = 5  # in square miles
        population_density = 20  # persons per square mile


        isp1_population = calculate_population(isp1_polygon)
        isp2_population = calculate_population(isp2_polygon)

        overlap_population = min( isp1_population*random.uniform(0.5, 0.99),  isp2_population*random.uniform(0.5, 0.99) )

        numerator = (isp1_population - overlap_population) * (isp2_population - overlap_population)
        denominator = isp1_population + isp2_population - overlap_population

        if numerator >= 0 and denominator > 0:
            affinity_score = math.sqrt(numerator) / denominator
        else:
            # Handle the case where the argument to sqrt is negative or denominator is zero
            affinity_score = 0.0  # or any other appropriate default value

        # Assign the affinity score to the DataFrame
        profile_df['Affinity_Score'] = affinity_score

        top_5_df = profile_df[profile_df['Order'].between(1, 5)]



        ws = [0.8, 0.6, 0.4, 0.9]

        ci = [0.1,0.4,0.3,0.8]

        cs = [0.81, 0.34, 0.56, 0.32]

        willingness_score = 0.91
        affinity_score = 0.62
        location = "Pune"

        response_data = {
            "ws":ws,
            "ci":ci,
            "cs":cs,
            "isp1Coordinates": isp_req_coordinates,
            "isp2Coordinates": isp_can_coordinates,
            "willingness_score": willingness_score,
            "affinity_score": affinity_score,
            "location": location,
            "dataframe": top_5_df.to_dict(orient='records')
        }

        return jsonify(response_data)
    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == '__main__':
    app.run(debug=True)


