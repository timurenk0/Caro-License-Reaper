import { describe, expect, it } from "vitest"
import { GraphCredentials, Job, NormalizedStudent } from "../../src/types"
import { getJob, storeJob } from "../../src/services/job-store.service"


describe("pending job storage", () => {
    it("should store and return a job", () => {
        const students: NormalizedStudent[] = [
            {
                id: "GH0000001",
                email: "student.first@gisma-student.com",
                status: "pending"
            },
            {
                id: "GH0000002",
                email: "student.second@gisma-student.com",
                status: "pending"
            }
        ];

        const credentials: GraphCredentials = {
            TENANT_ID: "test-tenant-id",
            CLIENT_ID: "test-client-id",
            CLIENT_SECRET: "test-client-secret"
        };
        
        storeJob("job-1", { students, credentials });

        const job = getJob("job-1");

        expect(job).toEqual({
            students,
            credentials
        });
    });
});