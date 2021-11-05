import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect } from "react";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

function createCANData(ID, Count, Len, B0, B1, B2, B3, B4, B5, B6, B7) {
  return { ID, Count, Len, B0, B1, B2, B3, B4, B5, B6, B7 };
}

// const rows = [
//   createCANData("0xDEAD", 159, 8, 1, 2, 3, 4, 5, 6, 7, 8),
// //   createCANData("0xBEEF", 259, 8, 1, 2, 3, 4, 5, 6, 7, 8),
// //   createCANData("0xDEAD", 359, 8, 1, 2, 3, 4, 5, 6, 7, 8),
// //   createCANData("0XBEEF", 459, 8, 1, 2, 3, 4, 5, 6, 7, 8),
// //   createCANData("0xDEAD", 559, 8, 1, 2, 3, 4, 5, 6, 7, 8),
// ];

export default function CAN_Table(props) {
  useEffect(() => {
    // console.log(props.data);
    // Object.keys(props.data)((row) => ( console.log("row ID:",props.data[row])));
    // Object.keys(props.data).map(function(key) {
    //    console.log("keyh: ",key)
    //    console.log("value: ",props.data[key])

    //   });
  });

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>CAN ID</TableCell>
            <TableCell align="right">Count</TableCell>
            <TableCell align="right">Length</TableCell>
            <TableCell align="right">B0</TableCell>
            <TableCell align="right">B1</TableCell>
            <TableCell align="right">B2</TableCell>
            <TableCell align="right">B3</TableCell>
            <TableCell align="right">B4</TableCell>
            <TableCell align="right">B5</TableCell>
            <TableCell align="right">B6</TableCell>
            <TableCell align="right">B7</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(props.data).map((row) => (
            <TableRow
              key={props.data[row].ID}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {props.data[row].ID}
              </TableCell>
               <TableCell align="right">{props.data[row].Count}</TableCell>
              <TableCell align="right">{props.data[row].LEN}</TableCell>
              <TableCell align="right">{props.data[row].B0}</TableCell>
              <TableCell align="right">{props.data[row].B1}</TableCell>
              <TableCell align="right">{props.data[row].B2}</TableCell>
              <TableCell align="right">{props.data[row].B3}</TableCell>
              <TableCell align="right">{props.data[row].B4}</TableCell>
              <TableCell align="right">{props.data[row].B5}</TableCell>
              <TableCell align="right">{props.data[row].B6}</TableCell>
              <TableCell align="right">{props.data[row].B7}</TableCell> 
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
