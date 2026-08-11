import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import type { StudentRow } from "../types"

const StudentList = ({
  studentRows
}: {
  studentRows: StudentRow[]
}) => {
  console.log(studentRows)
  
  return (
    <div>
        <p className="bg-gray-200">Student List (Total: {studentRows.length})</p>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableCell>#</TableCell>
              <TableCell>GH Number</TableCell>
              <TableCell>Email Address</TableCell>
            </TableHead>
            <TableBody>
              {studentRows.map((sr, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx+1}</TableCell>
                  <TableCell>{sr.id}</TableCell>
                  <TableCell>{sr.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
    </div>
  )
}

export default StudentList