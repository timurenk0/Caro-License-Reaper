import type { Job } from "../types";

const jobs = new Map<string, Job>();

export function storeJob(jobId: string, job: Job) {
    jobs.set(jobId, job);
}

export function getJob(jobId: string) {
    return jobs.get(jobId);
}

export function removeJob(jobId: string) {
    jobs.delete(jobId);
}