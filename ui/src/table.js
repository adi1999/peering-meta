import * as React from "react";
import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function CustomizedTables(data) {
  const [rows, setRows] = useState([{}]);
  const [cols, setCols] = useState([{}]);
  console.log(data);
  useEffect(() => {
    setRows(data.data);
    setCols(Object.keys(data.data));
  }, [data]);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Willingness Score</StyledTableCell>
            <StyledTableCell align="right">Affinity Score</StyledTableCell>
            <StyledTableCell align="right">Rank</StyledTableCell>
            <StyledTableCell align="right">Location</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell component="th" scope="row">
                {row.Decision_willingness_score}
              </StyledTableCell>
              <StyledTableCell align="right">
                {" "}
                {row.Affinity_Score}
              </StyledTableCell>
              <StyledTableCell align="right">{row.Order}</StyledTableCell>
              <StyledTableCell align="right">
                {" "}
                {row.peering_location}{" "}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
