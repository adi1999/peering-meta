import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faNetworkWired,
} from "@fortawesome/free-solid-svg-icons";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { Line, Radar } from "react-chartjs-2";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Table from "./table.js";

import axios from "axios";

const Dashboard = () => {
  const [requestorISP, setRequestorISP] = useState("");
  const [candidateISP, setCandidateISP] = useState("");
  const [contractIds, setContractIds] = useState([10, 89, 59, 12]);
  const [requestorScores, setRequestorScores] = useState([]);
  const [candidateScores, setCandidateScores] = useState([]);
  const [combinedScores, setCombinedScores] = useState([]);

  const [chartKey, setChartKey] = useState(0); // Key for chart re-render

  const [isps, setIsps] = useState([]);

  const [requestorLat, setRequestorLat] = useState(0);
  const [requestorLng, setRequestorLng] = useState(0);
  const [candidateLat, setCandidateLat] = useState(0);
  const [candidateLng, setCandidateLng] = useState(0);

  const [polygonData, setPolygonData] = useState([]);
  const [coverageArea, setCoverageArea] = useState([]);

  const [mapBounds, setMapBounds] = useState([]);
  const [coverage, setCoverage] = useState([]);

  const [apiData, setApiData] = useState({});

  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch ISP data from the backend API and populate dropdowns
    axios
      .get("http://127.0.0.1:5000/api/isps")
      .then((response) => {
        // Update state with response data
        setIsps(response.data.isps);
        // Populate dropdowns with ISP data
      })
      .catch((error) => {
        console.error("Error fetching ISP data: ", error);
      });
  }, []);

  const handleCheckClick = () => {
    // Make an API call to get contract IDs and scores
    axios
      .post("http://127.0.0.1:5000/api/peering", {
        requestorISP,
        candidateISP,
      })
      .then((response) => {
        // const { contracts, requestor, candidate, combined, polygon } =
        //   response.data;
        // // Update state with response data
        // setContractIds(contracts);
        // setRequestorScores(requestor);
        // setCandidateScores(candidate);
        // setCombinedScores(combined);
        // setPolygonData(polygon);
        setApiData(response.data);
        setData(response.data.dataframe);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching peering data: ", error);
      });
  };

  // Render the chart using contract IDs and scores
  const options = {
    maintainAspectRatio: false,
  };

  const coordinates = [
    [39.7392, -104.9903],
    [32.7767, -96.797],
    [25.7617, -80.1918],
    [41.8781, -87.6298],
    [39.0438, -77.4874],
    [34.0522, -118.2437],
    [37.3541, -121.9552],
  ];

  const initialCenter = [30, 0]; // Set an initial center
  const initialZoom = 1; // Set an initial zoom level
  const centerCoordinates = [20.5937, 78.9629];
  const zoomLevel = 1;

  // const isp1Coordinates = [
  //   [39.7392, -104.9903],
  //   [32.7767, -96.797],
  //   [25.7617, -80.1918],
  //   [41.8781, -87.6298],
  //   [39.0438, -77.4874],
  //   [34.0522, -118.2437],
  //   [37.3541, -121.9552],
  // ];

  // const isp2Coordinates = [
  //   [39.7392, -104.9903],
  //   [32.7767, -96.797],
  //   [25.7617, -80.1918],
  //   [40.7128, -74.006],
  //   [51.5074, -0.1278],
  //   [-33.8688, 151.2093],
  // ];

  const isp1Coordinates = [
    [26.8467, 80.9462],
    [25.3176, 82.9739],
    [28.6139, 77.209],
  ];
  const isp2Coordinates = [
    [26.8467, 80.9462],
    [27.1767, 78.0081],
    [25.3176, 82.9739],
  ];

  // useEffect(() => {
  //   const combinedCoordinates = [...isp1Coordinates, ...isp2Coordinates].filter(
  //     (coord, index, self) =>
  //       index === self.findIndex((c) => c[0] === coord[0] && c[1] === coord[1])
  //   );

  //   setCoverage(combinedCoordinates);
  // }, [isp1Coordinates, isp2Coordinates]);

  const chartData = {
    labels: contractIds,
    datasets: [
      {
        label: "Requestor ISP",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75, 192, 192, 0.4)",
        borderColor: "rgba(75, 192, 192, 1)",
        data: apiData?.ws,
      },
      {
        label: "Candidate ISP",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(255, 99, 132, 0.4)",
        borderColor: "rgba(255, 99, 132, 1)",
        data: apiData?.ci,
      },
      {
        label: "Combined",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(54, 162, 235, 0.4)",
        borderColor: "rgba(54, 162, 235, 1)",
        data: apiData?.cs,
      },
    ],
  };
  const dummyData = [
    (39.7392, -104.9903),
    (32.7767, -96.797),
    (25.7617, -80.1918),
    (41.8781, -87.6298),
    (39.0438, -77.4874),
    (34.0522, -118.2437),
    (37.3541, -121.9552),
  ];
  const RadarChartData = {
    labels: ["Latitude", "Longitude"],
    datasets: [
      {
        label: "Lat/Lng Data",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
        data: dummyData,
      },
    ],
  };

  const RadarOptions = {
    maintainAspectRatio: false,
    scale: {
      angleLines: {
        display: true,
      },
      ticks: {
        suggestedMin: -90, // Minimum latitude
        suggestedMax: 90, // Maximum latitude
      },
    },
  };

  const checkOverlap = (coord) => {
    return (
      isp1Coordinates.some((c1) => c1[0] === coord[0] && c1[1] === coord[1]) &&
      isp2Coordinates.some((c2) => c2[0] === coord[0] && c2[1] === coord[1])
    );
  };

  // Calculate overlap coverage
  const overlapCoverage = isp1Coordinates.filter((coord) =>
    checkOverlap(coord)
  );

  return (
    <>
      <div className="sidebar-is-reduced">
        <header className="l-header">
          <div className="l-header__inner clearfix">
            <div className="c-search">
              <p>Peering Manager</p>
            </div>
            <div className="header-icons-group">
              <div className="c-header-icon logout">
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </div>
            </div>
          </div>
        </header>
        <div className="l-sidebar">
          <div className="logo">
            <div className="logo__txt">P</div>
          </div>
          <div className="l-sidebar__content">
            <nav className="c-menu js-menu">
              <ul className="u-list">
                <li
                  className="c-menu__item is-active"
                  data-toggle="tooltip"
                  title="Flights"
                >
                  <div className="c-menu__item__inner">
                    <FontAwesomeIcon icon={faNetworkWired} />
                    <div className="c-menu-item__title">
                      <span>Flights</span>
                    </div>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <main className="l-main">
        <div className="content-wrapper content-wrapper--with-bg">
          <div className="content">
            <div className="left-side">
              <h1>Network Peering Compatibility</h1>
              <div>
                <label>Select Requestor ISP: </label>
                <select
                  value={requestorISP}
                  onChange={(e) => setRequestorISP(e.target.value)}
                >
                  <option value="">Select Requestor ISP</option>
                  {isps.map((isp) => (
                    <option key={isp} value={isp}>
                      {isp}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Select Candidate ISP: </label>
                <select
                  value={candidateISP}
                  onChange={(e) => setCandidateISP(e.target.value)}
                >
                  <option value="">Select Candidate ISP</option>
                  {isps.map((isp) => (
                    <option key={isp} value={isp}>
                      {isp}
                    </option>
                  ))}
                </select>
              </div>
              <button className="button-submit" onClick={handleCheckClick}>
                Check
              </button>
            </div>
          </div>
        </div>

        <div className="content-wrapper content-wrapper--with-bg">
          <div className="page-content">
            {/* <Line options={options} key={chartKey} data={chartData} /> */}
            <Table data={data} />
          </div>
          <div className="page-content">
            {/* <Radar options={RadarOptions} data={RadarChartData} /> */}

            <MapContainer
              center={centerCoordinates}
              zoom={zoomLevel}
              style={{ width: "100%", height: "250px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Polygon
                positions={
                  apiData?.isp1Coordinates?.length > 0
                    ? apiData?.isp1Coordinates
                    : isp1Coordinates
                }
                color="blue"
                fillOpacity={0.5}
              />
              <Polygon
                positions={
                  apiData?.isp2Coordinates?.length > 0
                    ? apiData?.isp2Coordinates
                    : isp2Coordinates
                }
                color="red"
                fillOpacity={0.5}
              />
            </MapContainer>
          </div>
        </div>
        {Object.keys(apiData).length > 0 ? (
          <div class="row">
            <div class="col-md-4">
              <div class="o-metric-box u-text-center">
                <div class="c-metric-container c-metric-container--green">
                  <div class="c-metric">
                    <span class="c-metric__hero">
                      {apiData?.affinity_score}
                    </span>
                    <span class="c-metric__secondary">Affinity Score</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="o-metric-box u-text-center">
                <div class="c-metric-container c-metric-container--green">
                  <div class="c-metric">
                    <span class="c-metric__hero">
                      {apiData?.willingness_score}
                    </span>
                    <span class="c-metric__secondary">Willingness Score</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="o-metric-box u-text-center">
                <div class="c-metric-container c-metric-container--green">
                  <div class="c-metric">
                    <span class="c-metric__hero">{apiData?.location}</span>
                    <span class="c-metric__secondary">
                      Recommended Peering Location
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
};

export default Dashboard;
