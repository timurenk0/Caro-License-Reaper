import type { LogRow } from "../types"

const Logger = ({
  logRows
}: {
  logRows: LogRow[]
}) => {
  const levelColors: Record<string, string> = {
    "success": "text-green-600",
    "warn": "text-amber-600",
    "info": "text-indigo-600",
    "error": "text-red-600"
  }
  
  return (
    <div className="bg-gray-200 h-full min-h-0 flex flex-col overflow-hidden">
        <p className="bg-gray-400 px-2 py-1 font-semibold shrink-0">Logger</p>
        <div className="p-2 flex-1 min-h-0 overflow-y-auto overflow-x-clip flex flex-col gap-y-2">
          {logRows.map(lr => (
            <p>
              <b className={`font-bold ${levelColors[lr.level]}`}>[{lr.level.toUpperCase()}] </b>
              {lr.message} ({lr.timestamp})
            </p>
          ))}
        </div>
    </div>
  )
}

export default Logger