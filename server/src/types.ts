export type NormalizedStudent = {
    id: string,
    email: string,
    status: "pending" | "processing" | "complete" | "error",
    message?: string
}

export type GraphCredentials = {
    TENANT_ID: string,
    CLIENT_ID: string,
    CLIENT_SECRET: string
}

export type Job = {
    students: NormalizedStudent[],
    credentials: GraphCredentials
}