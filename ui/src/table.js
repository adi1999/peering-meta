import * as React from "react";
import { useState, useEffect } from "react";

export default function CustomizedTables(data) {
  const [rows, setRows] = useState([{}]);
  const [cols, setCols] = useState([{}]);
  console.log(data);
  useEffect(() => {
    setRows(data.data);
    setCols(Object.keys(data.data));
  }, [data]);

  return (
    <table>
      <thead>
        <tr>
          <th>Column1</th>
          <th>Column2</th>
          <th>Column3</th>
          <th>Column4</th>
          <th>Column5</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>Demo value</td>
          <td>Demo value</td>
          <td>Demo value</td>
          <td>Demo value</td>
          <td>Demo value</td>
        </tr>
        <tr>
          <td>Demo value</td>
          <td>Demo value</td>
          <td>Demo value</td>
          <td>Demo value</td>
          <td>Demo value</td>
        </tr>
        <tr>
          <td>Demo value</td>
          <td>Demo value</td>
          <td>Demo value</td>
          <td>Demo value</td>
          <td>Demo value</td>
        </tr>
        <tr>
          <td>Demo value</td>
          <td>Demo value</td>
          <td>Demo value</td>
          <td>Demo value</td>
          <td>Demo value</td>
        </tr>
      </tbody>
    </table>
  );
}
