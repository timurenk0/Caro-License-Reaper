import request from "supertest"
import { describe, expect, it } from "vitest"
import app from "../../src/app"


describe("POST /upload/csv", () => {
    it("should parse and normalize a valid .csv file", async () => {
        const content = [
            "ID's,Email Address",
            "GH0000001,student.first@gisma-student.com",
            "GH0000002,student.second@gisma-student.com"
        ].join("\n");

        const response = await request(app).post("/api/upload/csv").attach("csv", Buffer.from(content), "test.csv");

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            filename: "test.csv",
            size: Buffer.byteLength(content),
            students: [
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
            ]
        });
    });

    it("should parse and normalize a .csv file with optional ID's column", async () => {
        const content = [
            "Email Address",
            "student.first@gisma-student.com",
            "student.second@gisma-student.com",
        ].join("\n");

        const response = await request(app).post("/api/upload/csv").attach("csv", Buffer.from(content), "test.csv");

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            filename: "test.csv",
            size: Buffer.byteLength(content),
            students: [
                {
                    id: undefined,
                    email: "student.first@gisma-student.com",
                    status: "pending"
                },
                {
                    id: undefined,
                    email: "student.second@gisma-student.com",
                    status: "pending"
                }
            ]
        });
    });

    it("should reject a request without a file", async () => {
        const response = await request(app).post("/api/upload/csv");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: {
                code: "VALIDATION_ERROR",
                message: "No file uploaded",
                status: 400
            }
        });
    });
    
    it("should reject a .csv file without the Email Address column", async () => {
        const content = [
            "ID's,Name",
            "GH0000001,John",
            "GH0000002,Alice"
        ].join("\n");

        const response = await request(app).post("/api/upload/csv").attach("csv", Buffer.from(content), "test.csv");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid .csv file format",
                hint: "Double-check students file content. Required field: 'Email Address'. Optional field: 'ID's'",
                status: 400
            }
        });
    });

    it("should reject a row with an empty Email Address", async () => {
        const content = [
            "ID's,Email Address",
            "GH0000001,student.first@gisma-student.com",
            "GH0000002,",
            "GH0000003,student.second@gisma-student.com"
        ].join("\n");

        const response = await request(app).post("/api/upload/csv").attach("csv", Buffer.from(content), "test.csv");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: {
                code: "VALIDATION_ERROR",
                message: "Corrupt .csv file",
                hint: `Row 3 has empty "Email Address" value`,
                status: 400
            }
        });
    });

    it("should reject multiple rows with an empty Email Address", async () => {
        const content = [
            "ID's,Email Address",
            "GH0000001,student.first@gisma-student.com",
            "GH0000002,",
            "GH0000003,",
            "GH0000004,student.second@gisma-student.com",
            "GH0000005,"
        ].join("\n");

        const response = await request(app).post("/api/upload/csv").attach("csv", Buffer.from(content), "test.csv");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: {
                code: "VALIDATION_ERROR",
                message: "Corrupt .csv file",
                hint: `Rows 3, 4 and 6 have empty "Email Address" value`,
                status: 400
            }
        });
    });
})