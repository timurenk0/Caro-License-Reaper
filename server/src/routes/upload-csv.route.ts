import { Router, type Request, type Response } from "express"
import multer from "multer";
import { parse } from "csv-parse/sync";
import normalizeStudents from "../services/normalize-students.service";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

type StudentsCSV = any & { "Email Address": string }

router.post("/upload/csv", upload.single("file"), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({
            error: "No .csv file uploaded!"
        });
    }

    const csv = req.file.buffer.toString("utf-8");
    
    const rows: StudentsCSV[] = parse(csv, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    if (!rows[0] || !("Email Address" in rows[0])) {
        console.error("No email address header found! Wrong .csv format uploaded")
    }

    const students = normalizeStudents(rows);

    return res.status(201).json({
        filename: req.file.originalname,
        size: req.file.size,
        students
    });
})


export default router;