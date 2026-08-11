export type NormalizedStudent = {
    id: string,
    email: string,
    status: "pending" | "processing" | "complete" | "error",
    message?: string
}