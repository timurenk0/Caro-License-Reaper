import request from "supertest"
import { describe, expect, it } from "vitest"
import app from "../../src/app"
import { GraphCredentials, NormalizedStudent } from "../../src/types"
import { storeConfig } from "../../src/services/config-store.service"
import { getJob } from "../../src/services/job-store.service"


describe("POST /api/start", () => {
    it("should create and store a job", async () => {
        const configId = "test-config-id";

        const credentials: GraphCredentials = {
            TENANT_ID: "test-tenant-id",
            CLIENT_ID: "test-client-id",
            CLIENT_SECRET: "test-client-secret"
        };
        
        const students: NormalizedStudent[] = [
            {
                id: "id-1",
                email: "student.first@gisma-student.com",
                status: "pending"
            },
            {
                id: "id-2",
                email: "student.second@gisma-student.com",
                status: "pending"
            }
        ];

        storeConfig(configId, credentials);

        const response = await request(app).post("/api/start").send({ configId, students });

        expect(response.status).toBe(202);
        expect(response.body).toEqual({
            jobId: expect.any(String)
        });
    
        const job = getJob(response.body.jobId);
        
        expect(job).toEqual({
            students,
            credentials
        });
    });

    it("should reject a request without a configId", async () => {
        const students: NormalizedStudent[] = [
            {
                id: "id-1",
                email: "student.first@gisma-student.com",
                status: "pending"
            },
            {
                id: "id-2",
                email: "student.second@gisma-student.com",
                status: "pending"
            }
        ];

        const response = await request(app).post("/api/start").send({ students });

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            error: "Missing configId (credentials)"
        });
    });

    it("should reject an unknown configId", async () => {
        const response = await request(app).post("/api/start").send({ configId: "doesn-not-exist", students: [] });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            error: "Graph configuration not found"
        });
    });
})