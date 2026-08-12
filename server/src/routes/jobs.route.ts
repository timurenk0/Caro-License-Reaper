import { Router, type Request, type Response } from "express"
import { addClient, removeClient, takePendingJob } from "../services/client-store.service"
import { processStudents } from "../services/process-students.service"
import { getJob } from "../services/job-store.service"


const router = Router();

router.get("/jobs/:jobId/events", (req: Request, res: Response) => {
    let { jobId } = req.params;
    if (typeof jobId !== "string") {
        jobId = jobId[0]
    }

    console.log("SSE CONNECT:", jobId);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    addClient(jobId, res);

    const job = getJob(jobId);

    if (!job) {
        res.write(`data: ${JSON.stringify({ type: "error", message: "Job not found" })}\n\n`)
        res.end();
        return;
    };

    processStudents(jobId, job.students, job.credentials).catch(err => console.error(`Job ${jobId} failed`, err));

    req.on("close", () => {
        console.log("SSE CLOSE:", jobId);
        removeClient(jobId);
    });

    res.on("close", () => {
        console.log("RESPONSE CLOSED:", jobId);
    });

    res.on("finish", () => {
        console.log("RESPONSE FINISHED:", jobId);
    })
})


export default router;