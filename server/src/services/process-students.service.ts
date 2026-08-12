import { type NormalizedStudent } from "../types"
import processStudent from "./process-student.service"
import { sendJobUpdate } from "./client-store.service";



export async function processStudents(
    jobId: string,
    students: NormalizedStudent[]
) {
    console.log("Started processing students");
    for (const student of students) {
        try {
            await processStudent(student);

            sendJobUpdate(jobId, {
                email: student.email,
                status: "success",
                message: "Licenses removed successfully"
            });
        } catch (error) {
            sendJobUpdate(jobId, {
                email: student.email,
                status: "error",
                message: error instanceof Error ? 
                    error.message :
                    "Unknown error"
            });
            
        }
    }

    sendJobUpdate(jobId, {
        type: "complete"
    });
}