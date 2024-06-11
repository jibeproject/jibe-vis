import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const indicators: { [key: string]: any } = {
    "name": "Name",
    "length": "Length (m)",
    "cycleTime": "Cycle time (seconds)",
    "walkTime": "Walking time (seconds)",
    "carSpeedLimitMPH": "Car speed limit (MPH; note: need conversion *1.609 for Melbourne)",
    "width": "Width (m)",
    "lanes": "Lanes",
    "aadt": "Average annual daily traffic",
    "vgvi": "Viewshed Greenness Visibility Index (VGVI)",
    "bikeStressDiscrete": "Bike stress classification (UK)",
    "bikeStress": "Bike stress score (UK)",
    "walkStress": "Walk stress score (UK)",
    "LTS": "Level of traffic stress (Victoria)"
    };
//   function createData(data: { [key: string]: any }): Array<{ key: string, value: any }> {
//       return Object.entries(data).map(([key, value]) => ({ value, key }));
//     }

    // const rows = createData(indicators);

    export default function BasicTable(indicators: { [key: string]: any }) {
        return (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">variable</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* // iterate over indicators */}
                {Object.entries(indicators).map(([key, value]: [string, any]) => (
                    <TableRow
                        key={key}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell component="th" scope="row">
                            {value}
                        </TableCell>
                        <TableCell align="right">{key}</TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }
export function TestThings() {
    return(
        <div>
            <h1>Test Things</h1>
            <p>Test things are things that are tested.</p>
            {BasicTable(indicators)}
        </div>
    );
}