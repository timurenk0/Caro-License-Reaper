import { GraphCredentials, NormalizedStudent } from "../types";
import { Client } from "@microsoft/microsoft-graph-client"
import { sendLogUpdate } from "./client-store.service"
import { createGraphClient } from "./graph-client.service";


const licenses = {
    "Microsoft Power Automate Free": "f30db892-07e9-47e9-837c-80727f46fd3d",
    "Office 365 A1 for Students": "314c4481-f395-4525-be8b-2ec4bb1e9d91",
    "Microsoft 365 Apps for Students": "c32f9321-a627-406d-a114-1f9c81aaafac"
};


export default async function processStudent(jobId: string, student: NormalizedStudent, credentials: GraphCredentials, client = createGraphClient(credentials)) {
    try {

        const studentId = (await fetchStudentId(jobId, client, student.email)).value[0].id;
        await removeLicenses(jobId, client, studentId, student.email);

        console.log("[GRAPH_SUCCESS] Finished for current student.");        
    } catch (error) {
        sendLogUpdate(jobId, `Failed to process student "${student.email}"`, "error");
        console.log(error);
        throw error;
    }
}

function sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
}

async function graphRetry(
    func: () => Promise<void>,
    retries = 6,
    delay = 2000
) {
    try {
        return await func();
    } catch (error: any) {
        const code = error.code || "";
        const message = error.message || ""

        if (
            retries > 0 &&
            (code === "Directory_ConcurrencyViolation" || message.includes("conccurent requests"))
        ) {
            console.log(`\n[GRAPH_RETRY] Concurrency error. Waiting ${delay}ms... (${retries} retries left)`);
            await sleep(delay);

            return graphRetry(func, retries-1, delay*1.5);
        }

        throw error;
    }
}

async function fetchStudentId(jobId: string, client: Client, email: string) {
    try {
        const studentId = await client.api(`/users?$filter=mail eq '${email}'`).get();
        sendLogUpdate(jobId, `Fetched user ID for student "${email}"`);

        return studentId;
    } catch (error) {
        console.error("[GRAPH_ERROR] Failed to fetch email:", email);
        console.log(error);
        sendLogUpdate(jobId, `Failed to fetch user ID for student "${email}"`, "warn");
        return null;
    }
}

async function removeLicenses(jobId: string, client: Client, id: string, email: string) {
    for (const [name, license] of Object.entries(licenses)) {
        console.log(`\n\n[GRAPH_INFO] Run for license ${license}`);

        try {
            await graphRetry(() => client
                                        .api(`/users/${id}/assignLicense`)
                                        .post({
                                            addLicenses: [],
                                            removeLicenses: [license]
                                        })
                            );

            console.log(`\n[GRAPH_SUCCESS] License ${license} removed for user ${id}`);
            sendLogUpdate(jobId, `Removed "${name}" license for student "${email}"`);

            await sleep(2000);
        } catch (error: any) {
            const message = error.message || "";
            console.log(error);

            if (message.includes("User does not have a corresponding license")) {
                console.log(`\n[GRAPH_WARN] License ${license} not assigned to user ${id}, skipping...`);
                sendLogUpdate(jobId, `Student "${email}" is missing "${name}" license. Skipping...`, "warn");
                continue;
            }

            throw error;
        }
    }
}