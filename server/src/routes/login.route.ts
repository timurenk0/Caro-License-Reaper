import { Router, type Request, type Response } from "express"
import multer from "multer"
import dotenv from "dotenv"
import { GraphCredentials } from "../types";
import { storeConfig } from "../services/config-store.service";


const router = Router();

const uplaod = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50_000
    }
});

router.post("/login", uplaod.single("env"), (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: "No .env file uploaded!" });

    const parsed = dotenv.parse(req.file.buffer.toString("utf-8"));

    const credentials: GraphCredentials = {
        TENANT_ID: parsed.TENANT_ID,
        CLIENT_ID: parsed.CLIENT_ID,
        CLIENT_SECRET: parsed.CLIENT_SECRET
    };

    if (!credentials.TENANT_ID || !credentials.CLIENT_ID || !credentials.CLIENT_SECRET) {
        return res.status(400).json({
            error: "Invalid .env file. Required: TENANT_ID, CLIENT_ID, and CLIENT_SECRET"
        });
    }

    const configId = crypto.randomUUID();

    storeConfig(configId, credentials);

    return res.status(200).json({
        configId
    });
})


export default router;