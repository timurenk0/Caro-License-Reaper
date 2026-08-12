import { GraphCredentials, NormalizedStudent } from "../types";
import { Client } from "@microsoft/microsoft-graph-client"
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials"
import { ClientSecretCredential } from "@azure/identity";


const licenses = [
    "f30db892-07e9-47e9-837c-80727f46fd3d", // Microsoft Power Automate Free
    "314c4481-f395-4525-be8b-2ec4bb1e9d91",  // Office 365 A1 for Students
    "c32f9321-a627-406d-a114-1f9c81aaafac" // Microsoft 365 Apps for Students
];


export default async function processStudent(student: NormalizedStudent, credentials: GraphCredentials) {
    try {
        const tokenCredential = new ClientSecretCredential(credentials.TENANT_ID, credentials.CLIENT_ID, credentials.CLIENT_SECRET);
        const authProvider = new TokenCredentialAuthenticationProvider(tokenCredential, { scopes: ["https://graph.microsoft.com/.default"] });

        const client = Client.initWithMiddleware({
            authProvider
        });

        const studentId = (await fetchStudentId(client, student.email)).value[0].id;
        await removeLicenses(client, studentId);

        console.log("[GRAPH_SUCCESS] Finished for current student.");        
    } catch (error) {
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

async function fetchStudentId(client: Client, email: string) {
    try {
        return await client.api(`/users?$filter=mail eq '${email}'`).get();
    } catch (error) {
        console.error("[GRAPH_ERROR] Failed to fetch email:", email);
        return null;
    }
}

async function removeLicenses(client: Client, id: string) {
    for (const license of licenses) {
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

            await sleep(2000);
        } catch (error: any) {
            const message = error.message || "";
            console.log(message);

            if (message.includes("User does not have a corresponding license")) {
                console.log(`\n[GRAPH_WARN] License ${license} not assigned to user ${id}, skipping...`);
                continue;
            }

            throw error;
        }
    }
}