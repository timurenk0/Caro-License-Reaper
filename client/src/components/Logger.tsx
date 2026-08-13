import { useState } from "react";
import type { LogRow } from "../types"
import { Button } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";

const Logger = ({
  logRows
}: {
  logRows: LogRow[]
}) => {

  const [showLogs, setShowLogs] = useState(false);
  
  const levelColors: Record<string, string> = {
    "success": "text-green-600",
    "warn": "text-amber-600",
    "info": "text-indigo-600",
    "error": "text-red-600"
  }
  
  return (
    <div className="h-full min-h-0">
      <Button hidden={showLogs} onClick={() => setShowLogs(true)} startIcon={<ArrowDownward />} className="w-full" variant="contained" color="inherit">
        <p>Show Logs</p>
      </Button>
      <div hidden={!showLogs} className="bg-gray-200 h-full min-h-0 flex flex-col overflow-hidden">
          <div className="bg-gray-400 py-1 px-2 flex justify-between items-center w-full">
            <p className="font-semibold shrink-0">Logger</p>
            <Button variant="contained" color="inherit" size="small" onClick={() => setShowLogs(false)} startIcon={<ArrowUpward />}>Hide Logs</Button>
          </div>
          <div className="p-2 flex-1 min-h-0 overflow-y-auto overflow-x-clip flex flex-col gap-y-2">
            {logRows.length > 0 ? logRows.map((lr, idx) => (
              <p key={idx}>
                <b className={`font-bold ${levelColors[lr.level]}`}>&gt;[{lr.level.toUpperCase()}] </b>
                {lr.message} - {lr.timestamp}
              </p>
            )) : (
              <i>&gt; No logs yet... (Start the process first)</i>
            )}
          </div>
      </div>
    </div>
  )
}

export default Logger