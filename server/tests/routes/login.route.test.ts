import request from "supertest"
import { describe, expect, it } from "vitest"
import app from "../../src/app"
import { getConfig } from "../../src/services/config-store.service";


describe("POST /api/login", () => {
    it("should accept a vaild .env file", async () => {
        const content = `
            TENANT_ID=test-tenant-id
            CLIENT_id=test-client-id
            CLIENT_SECRET=test-client-secret
        `;

        const response = await request(app).post("/api/login").attach("env", Buffer.from(content), "test.env");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            configId: expect.any(String)
        });
    });

    it("should reject a request without an .env file", async () => {
        const response = await request(app).post("/api/login");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: "No .env file uploaded!"
        });
    });

    it("should reject an .env file with missing credentialis", async () => {
        const content = `
            TENANT_ID=test-tenant-id
            CLIENT_ID=test-client-id
        `;

        const response = await request(app).post("/api/login").attach("env", Buffer.from(content), "test.env");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid .env file format!",
                hint: "Double-check credentials file content. Required fields: TENANT_ID, CLIENT_ID, CLIENT_SECRET",
                status: 400
            }
        });
    });

    it("should store the uploaded Graph credentials", async () => {
        const content = `
            TENANT_ID=test-tenant-ID
            CLIENT_ID=test-client-ID
            CLIENT_SECRET=test-client-secret
        `;

        const response = await request(app).post("/api/login").attach("env", Buffer.from(content), "test.env");
        const configId = response.body.configId;

        const config = getConfig(configId);

        expect(config).toEqual({
            TENANT_ID: "test-tenant-id",
            CLIENT_ID: "test-client-id",
            CLIENT_SECRET: "test-client-secret"
        });
    });

    it("should not return any credentials", async () => {
        const content = `
            TENANT_ID=test-tenant-ID
            CLIENT_ID=test-client-ID
            CLIENT_SECRET=test-client-secret
        `;

        const response = await request(app).post("/api/login").attach("env", Buffer.from(content), "test.env");
    
        expect(response.body).toEqual({
            configId: expect.any(String)
        });
    });
});