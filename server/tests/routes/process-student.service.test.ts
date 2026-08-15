import { beforeEach, describe, expect, it, vi } from "vitest"
import { GraphCredentials, NormalizedStudent } from "../../src/types";
import processStudent from "../../src/services/process-student.service";


describe("single student processing", () => {
    beforeEach(() => vi.restoreAllMocks());
    
    const licenses = {
        "Microsoft Power Automate Free": "f30db892-07e9-47e9-837c-80727f46fd3d",
        "Office 365 A1 for Students": "314c4481-f395-4525-be8b-2ec4bb1e9d91",
        "Microsoft 365 Apps for Students": "c32f9321-a627-406d-a114-1f9c81aaafac"
    };

    it("should fetch the student and remove all licenses", async () => {
        const jobId = "job-id";

        const student: NormalizedStudent = {
            id: "GH0000001",
            email: "student.first@gisma-student.com",
            status: "pending"
        };

        const credentials: GraphCredentials = {
            TENANT_ID: "test-tenant-id",
            CLIENT_ID: "test-client-id",
            CLIENT_SECRET: "test-client-secret"
        };

        const get = vi.fn().mockResolvedValue({
            value: [
                {
                    id: "graph-client-id"
                }
            ]
        });

        const post = vi.fn().mockResolvedValue({});

        const api = vi.fn().mockImplementation((path: string) => {
            if (path.includes("/users/$filter=")) {
                return { get };
            }

            return { post }
        });

        const mockGraphClient = { api };

        await processStudent(
            jobId,
            student,
            credentials,
            mockGraphClient as any
        );

        expect(get).toHaveBeenCalledTimes(1);
        expect(get).toHaveBeenCalledWith();
        expect(post).toHaveBeenCalledTimes(3);
        expect(post).toHaveBeenNthCalledWith(1, {
            addLicenses: [],
            removeLicenses: [
                Object.values(licenses)[0]
            ]
        });
        expect(post).toHaveBeenNthCalledWith(2, {
            addLicenses: [],
            removeLicenses: [
                Object.values(licenses)[1]
            ]
        });
        expect(post).toHaveBeenNthCalledWith(3, {
            addLicenses: [],
            removeLicenses: [
                Object.values(licenses)[2]
            ]
        });
    });

    it("should skip licenses that the student dows not have", async () => {
        const student: NormalizedStudent = {
            id: "GH0000001",
            email: "student.first@gisma-student.com",
            status: "pending"
        };

        const credentials: GraphCredentials = {
            TENANT_ID: "test-tenant-id",
            CLIENT_ID: "test-client-id",
            CLIENT_SECRET: "test-client-secret"
        };
        
        const get = vi.fn().mockResolvedValue({
            value: [
                { id: "graph-user-id" }
            ]
        });

        const post = vi.fn().mockRejectedValueOnce(
            new Error("User does not have a corresponding license")
        );

        const api = vi.fn().mockImplementation((path: string) => {
            if (path.includes("/users?$filter=")) {
                return { get }
            }

            return { post }
        });

        const mockGraphClient = { api };
    
        await expect(processStudent(
            "job-1",
            student,
            credentials,
            mockGraphClient as any
        )).resolves.not.toThrow();
        
        expect(post).toHaveBeenCalledTimes(3);
    });

    it("should throw when Graph returns an unexpected error", async () => {
        const student: NormalizedStudent = {
            id: "GH0000001",
            email: "student.first@gisma-student.com",
            status: "pending"
        };

        const credentials: GraphCredentials = {
            TENANT_ID: "test-tenant-id",
            CLIENT_ID: "test-client-id",
            CLIENT_SECRET: "test-client-secret"
        };
        
        const get = vi.fn().mockResolvedValue({
            value: [
                { id: "graph-user-id" }
            ]
        });

        const post = vi.fn().mockRejectedValue(
            new Error("Internal Server Error")
        );

        const api = vi.fn().mockImplementation((path: string) => {
            if (path.includes("/users?$filter=")) {
                return { get }
            }

            return { post }
        });

        const mockGraphClient = { api };

        await expect(processStudent(
            "job-1",
            student,
            credentials,
            mockGraphClient as any
        )).rejects.toThrow("Internal Server Error");
    });

    it("should throw when the student cannot be found", async () => {
        const student: NormalizedStudent = {
            id: "GH0000001",
            email: "student.first@gisma-student.com",
            status: "pending"
        };

        const credentials: GraphCredentials = {
            TENANT_ID: "test-tenant-id",
            CLIENT_ID: "test-client-id",
            CLIENT_SECRET: "test-client-secret"
        };
        
        const get = vi.fn().mockResolvedValue({
            value: []
        });

        const api = vi.fn().mockReturnValue({
            get
        });

        const mockGraphClient = { api };

        await expect(processStudent(
            "job-1",
            student,
            credentials,
            mockGraphClient as any
        )).rejects.toThrow();
    });

    it("")
});