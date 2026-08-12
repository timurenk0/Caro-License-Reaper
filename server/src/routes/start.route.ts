import { Router, type Request, type Response } from "express"
import { getConfig } from "../services/config-store.service"
import { registerJob } from "../services/client-store.service"
import { storeJob } from "../services/job-store.service";

const router = Router();

router.post("/start", (req: Request, res: Response) => {
    const { configId, students } = req.body;

    if (!configId) return res.status(400).json({ error: "Missing configId (credentials)" });
    
    const credentials = getConfig(configId);

    if (!credentials) return res.status(401).json({ error: "Graph configuration not found!" });

    const jobId = crypto.randomUUID();
    
    storeJob(jobId, {
        students,
        credentials
    });

    return res.status(202).json({
        jobId
    });
});

export default router;