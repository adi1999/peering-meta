import * as React from "react";
import { useState, useEffect } from "react";

export default function CustomizedTables(data) {
  const [rows, setRows] = useState([{}]);
  const [cols, setCols] = useState([{}]);
  console.log(data);
  useEffect(() => {
    setRows(data.data);
    console.log(data.data);
    setCols(Object.keys(data.data));
  }, [data]);

  return (
    <table>
      <thead>
        <tr>
          <th>Willingness Score</th>
          <th>Affinity Score</th>
          <th>Rank</th>
          <th>Location</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => {
          return (
            <tr>
              <td>{row.Affinity_Score?.toFixed(4)}</td>
              <td>{row.Decision_willingness_score?.toFixed(4)}</td>
              <td>{row.Order}</td>
              <td>{row.peering_location}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
