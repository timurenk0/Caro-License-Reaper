import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import type { StudentRow } from "../types"
import React from "react"
import { Check, Error, Pending, QueryBuilder } from "@mui/icons-material"

const StudentList = ({
  studentRows
}: {
  studentRows: StudentRow[]
}) => {
  
  const processedCount = studentRows.filter(s => s.status === "success" || s.status === "error").length;
  
  const statusIcons: Record<string, React.ReactNode> = {
    "pending": <Pending color="disabled" />,
    "processing": <QueryBuilder color="warning" />,
    "success": <Check color="success" />,
    "error": <Error color="error" />
  }
  
  return (
    <div>
        <p className="bg-gray-200">Student List (Processed: {processedCount}/{studentRows.length})</p>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableCell>#</TableCell>
              <TableCell>GH Number</TableCell>
              <TableCell>Email Address</TableCell>
              <TableCell>Status</TableCell>
            </TableHead>
            <TableBody>
              {studentRows.map((sr, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx+1}</TableCell>
                  <TableCell>{sr.id}</TableCell>
                  <TableCell>{sr.email}</TableCell>
                  <TableCell>{statusIcons[sr.status] || "idi nahuy"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
    </div>
  )
}

export default StudentList