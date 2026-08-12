import { Router, type Request, type Response } from "express"
import { processStudents } from "../services/process-students.service";
import { registerJob } from "../services/client-store.service";

const router = Router();

router.post("/start", (req: Request, res: Response) => {
    const students = req.body;

    const jobId = crypto.randomUUID();
    registerJob(jobId, students);

    return res.status(202).json({
        jobId
    });
});

export default router;