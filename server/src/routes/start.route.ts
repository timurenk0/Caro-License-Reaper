import { Router, type Request, type Response } from "express"

const router = Router();

router.post("/start", (req: Request, res: Response) => {
    const students = req.body;
    console.log("Recevied students:", students);

    const jobId = crypto.randomUUID();
    
    return res.status(202).json({
        jobId
    });
});

export default router;