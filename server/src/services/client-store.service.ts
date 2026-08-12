import type { Response } from "express"
import { NormalizedStudent } from "../types";


const clients = new Map<string, Response>();
const pendingJobs = new Map<string, NormalizedStudent[]>();

export function registerJob(jobId: string, students: NormalizedStudent[]) {
    console.log("Job registered!");
    pendingJobs.set(jobId, students);
}

export function takePendingJob(jobId: string): NormalizedStudent[] | undefined {
    const students = pendingJobs.get(jobId);
    pendingJobs.delete(jobId);

    console.log("Job taken!");

    return students;
}

export function addClient(jobId: string, res: Response) {
    console.log("CLIENT ADDED:", jobId);
    console.log("ALREADY EXISTS:", clients.has(jobId));
    clients.set(jobId, res);
}

export function removeClient(jobId: string) {
    console.log("CLIENT REMOVED:", jobId);
    clients.delete(jobId);
}

export function sendJobUpdate(jobId: string, data: unknown) {
    const res = clients.get(jobId);

    if (!res) return;

    res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function sendLogUpdate(jobId: string, message: string, level: "info" | "success" | "warn" | "error" = "info") {
    sendJobUpdate(jobId, {
        type: "log",
        level,
        message,
        timestamp: new Date().toISOString()
    });
}