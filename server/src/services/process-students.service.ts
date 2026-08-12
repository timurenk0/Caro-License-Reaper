import { GraphCredentials, type NormalizedStudent } from "../types"
import processStudent from "./process-student.service"
import { sendJobUpdate, sendLogUpdate } from "./client-store.service";



export async function processStudents(
    jobId: string,
    students: NormalizedStudent[],
    credentials: GraphCredentials
) {
    console.log("Started processing students");
    for (const student of students) {
        sendJobUpdate(jobId, {
            email: student.email,
            status: "processing",
            message: "Processing student entry..."
        })
        
        try {
            await processStudent(jobId, student, credentials);

            sendJobUpdate(jobId, {
                email: student.email,
                status: "success",
                message: "Licenses removed successfully"
            });
            sendLogUpdate(jobId, `Revoked all license from student ${student.email}`, "success");
        } catch (error) {
            sendJobUpdate(jobId, {
                email: student.email,
                status: "error",
                message: error instanceof Error ? 
                    error.message :
                    "Unknown error"
            });
            sendLogUpdate(jobId, `Failed to remove licenses for student ${student.email}`, "error");
            
        }
    }

    sendJobUpdate(jobId, {
        type: "complete"
    });
    sendLogUpdate(jobId, "Finished the process.", "success");
    console.log("[GRAPH_FINISH] Finished the process!");
}
