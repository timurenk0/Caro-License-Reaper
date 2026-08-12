export type StudentJob = { email: string, status: "pending" | "processing" | "success" | "error", message?: string };
export type StudentRow = StudentJob & { id: string }
export type LogRow = { message: string, level: string, timestamp: string }
export type ServerError = {
    code: string,
    message: string,
    hint?: string,
    status: number
}