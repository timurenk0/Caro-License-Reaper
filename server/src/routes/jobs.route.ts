import { Router, type Request, type Response } from "express"
import { addClient, removeClient, takePendingJob } from "../services/client-store.service";
import { processStudents } from "../services/process-students.service";


const router = Router();

router.get("/jobs/:jobId/events", (req: Request, res: Response) => {
    let { jobId } = req.params;
    if (typeof jobId !== "string") {
        jobId = jobId[0]
    }

    console.log(jobId);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    addClient(jobId, res);

    const students = takePendingJob(jobId);
    if (students) {
        processStudents(jobId, students)
    } else {
        res.write(`data: ${JSON.stringify({ type: "error", message: "Job not found" })}`)
    }

    req.on("close", () => {
        removeClient(jobId);
    });
})


export default router;