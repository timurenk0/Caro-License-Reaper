import { useState } from "react";
import CSVUploadForm from "./components/CSVUploadForm";
import StudentList from "./components/StudentList";
import type { StudentRow } from "./types";
import { Button } from "@mui/material";
import { Send } from "@mui/icons-material";

export default function App() {

  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);

  const startMutation = async () => {
    try {
      if (studentRows.length === 0) throw new Error("Student list is empty!");
    
      const res = await fetch("http://localhost:3000/api/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(studentRows)
      });

      const { jobId } = await res.json();
      if (!res.ok) throw new Error("Failed to start license removal");
      
      const eventSource = new EventSource(
        `http://localhost:3000/api/jobs/${jobId}/events`
      );

      console.log(jobId);

      eventSource.onmessage = (e) => {
        const update = JSON.parse(e.data);
        console.log("Student update:", update);

        setStudentRows(current => current.map(s => s.email === update.email ? {
          ...s,
          status: update.status,
          message: update.message
        } : s));

        if (update.type === "complete") eventSource.close();
      }

    } catch (error) {
      console.error(error);
      return;
    }
  }

  return (
    <main className="h-full p-2 grid grid-cols-2 gap-8">
      <section>
        <p>You've succeffully logged in!</p>

        <CSVUploadForm setterFunc={setStudentRows} />
        <div className="my-4 flex justify-end">
          <Button variant="contained" color="success" endIcon={<Send />} onClick={startMutation}>Start</Button>
        </div>
        <StudentList studentRows={studentRows} />
      </section>
    </main>
  );
}