import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import Dashboard from "./dashboard";

const App = () => {
  const [requestorISP, setRequestorISP] = useState("");
  const [candidateISP, setCandidateISP] = useState("");
  const [contractIds, setContractIds] = useState([]);
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
      .post("http://127.0.0.1:5000/api/peering", { requestorISP, candidateISP })
      .then((response) => {
        const { contracts, requestor, candidate, combined, polygon } =
          response.data;
        // Update state with response data
        setContractIds(contracts);
        setRequestorScores(requestor);
        setCandidateScores(candidate);
        setCombinedScores(combined);
        setPolygonData(polygon);
      })
      .catch((error) => {
        console.error("Error fetching peering data: ", error);
      });
  };

  // Render the chart using contract IDs and scores
  const chartData = {
    labels: contractIds,
    datasets: [
      {
        label: "Requestor ISP",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75, 192, 192, 0.4)",
        borderColor: "rgba(75, 192, 192, 1)",
        data: requestorScores,
      },
      {
        label: "Candidate ISP",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(255, 99, 132, 0.4)",
        borderColor: "rgba(255, 99, 132, 1)",
        data: candidateScores,
      },
      {
        label: "Combined",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(54, 162, 235, 0.4)",
        borderColor: "rgba(54, 162, 235, 1)",
        data: combinedScores,
      },
    ],
  };

  return (
    <div className="maxH">
      <Dashboard />
    </div>
  );
};

export default App;
