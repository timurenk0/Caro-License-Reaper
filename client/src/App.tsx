import { useState } from "react";
import CSVUploadForm from "./components/CSVUploadForm";
import StudentList from "./components/StudentList";
import type { ServerError, StudentRow, LogRow } from "./types";
import { Button } from "@mui/material";
import { Send } from "@mui/icons-material";
import LoginForm from "./components/LoginForm";
import ErrorCard from "./components/ErrorCard";
import Logger from "./components/Logger";

export default function App() {

  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
  const [logRows, setLogRows] = useState<LogRow[]>([]);
  const [configId, setConfigId] = useState("");
  const [execTime, setExecTime] = useState(0);
  const [err, setErr] = useState<ServerError | null>(null);

  const startMutation = async () => {
    try {
      if (studentRows.length === 0) {
        setErr({
          code: "VALIDATION_ERROR",
          message: "Uploaded .csv file is empty",
          status: 400
        });
        return;
      };

      const res = await fetch("http://localhost:3000/api/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          configId,
          students: studentRows
        })
      });

      const { jobId } = await res.json();
      if (!res.ok) throw new Error("Failed to start license removal");
      
      const eventSource = new EventSource(
        `http://localhost:3000/api/jobs/${jobId}/events`
      );

      const start = performance.now();
      eventSource.onmessage = (e) => {
        const update = JSON.parse(e.data);
        console.log("Student update:", update);

        if (update.type === "log") {
          setLogRows(current => [
            ...current,
            {
              level: update.level,
              message: update.message,
              timestamp: update.timestamp
            }
          ]);
        }
        
        setStudentRows(current => current.map(s => s.email === update.email ? {
          ...s,
          status: update.status,
          message: update.message
        } : s));

        if (update.type === "complete") {
          eventSource.close();
          const end = performance.now();
          setExecTime(end-start);
        }
      }

    } catch (error) {
      console.error(error);
      return;
    }
  }

  return (
    <main className="p-4 h-full min-h-0 overflow-hidden flex flex-col">
      { !configId ? (
        <LoginForm setterFunc={setConfigId} />
      ) : (
        <div className="h-fulul min-h-0 flex flex-col">

          <div hidden={!!err} className="grid grid-cols-2 gap-8 h-full min-h-0">

            <section className="flex flex-col min-h-0 h-full">
              <p>You've succeffully logged in!</p>

              <CSVUploadForm setStudentRows={setStudentRows} setErr={setErr} />

              <div className="my-4 flex justify-end">
                <Button disabled={studentRows.length === 0} variant="contained" color="success" endIcon={<Send />} onClick={startMutation}>Start</Button>
              </div>

              <div className="flex-1 min-h-0">
                <StudentList studentRows={studentRows} execTime={execTime} />
              </div>
            </section>

            <section className="flex flex-col min-h-0 h-full">
              <Logger logRows={logRows} />
            </section>
          </div>

          {err && (
            <ErrorCard error={err} onClose={setErr} />
          )}
          
        </div>
      ) }
    </main>
  );
}