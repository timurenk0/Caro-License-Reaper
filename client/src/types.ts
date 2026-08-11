export type StudentJob = { email: string, status: "pending" | "processing" | "success" | "error", message?: string };
export type StudentRow = StudentJob & { id: string }