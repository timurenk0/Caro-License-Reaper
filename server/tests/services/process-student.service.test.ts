import { beforeEach, describe, expect, it, vi } from "vitest"
import { GraphCredentials, NormalizedStudent } from "../../src/types";
import processStudent from "../../src/services/process-student.service";
import { ClientSecretCredential } from "@azure/identity";
import { sendLogUpdate } from "../../src/services/client-store.service";
import { Client } from "@microsoft/microsoft-graph-client";


vi.mock("@azure/identity", () => ({
    ClientSecretCredential: vi.fn()
}));

vi.mock("@microsoft/microsoft-graph-client", () => ({
    Client: {
        initWithMiddleware: vi.fn()
    }
}));

vi.mock("../../src/services/client-store.service", () => ({
    sendLogUpdate: vi.fn()
}));

describe("single student processing", () => {
    const jobId = "job-123";

    const student = {
        id: "student-1",
        email: "student@example.com",
        status: "pending" as const
    };

    const credentials = {
        TENANT_ID: "tenant-id",
        CLIENT_ID: "client-id",
        CLIENT_SECRET: "client-secret"
    };

    const licenses = {
        "Microsoft Power Automate Free": "f30db892-07e9-47e9-837c-80727f46fd3d",
        "Office 365 A1 for Students": "314c4481-f395-4525-be8b-2ec4bb1e9d91",
        "Microsoft 365 Apps for Students": "c32f9321-a627-406d-a114-1f9c81aaafac"
    };

    const getMock = vi.fn();
    const postMock = vi.fn();
    const apiMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        getMock.mockResolvedValue({
            value: [
                {
                    id: "graph-user-123"
                }
            ]
        });

        postMock.mockResolvedValue({});

        apiMock.mockImplementation((path: string) => {
            if (path.startsWith("/users?$filter=")) {
                return {
                    get: getMock
                };
            }

            return {
                post: postMock
            };
        });

        vi.mocked(Client.initWithMiddleware).mockReturnValue({
            api: apiMock
        } as any);
    });
    
    

    it("should fetch the student and remove all licenses", async () => {
        const sleepMock = vi.fn().mockResolvedValue(undefined);
        
        await processStudent(
            jobId,
            student,
            credentials,
            sleepMock,
            undefined
        );

        expect(ClientSecretCredential).toHaveBeenCalledWith(
            credentials.TENANT_ID,
            credentials.CLIENT_ID,
            credentials.CLIENT_SECRET,
        );
        expect(Client.initWithMiddleware).toHaveBeenCalledTimes(1);
        expect(getMock).toHaveBeenCalledTimes(1);
        expect(apiMock).toHaveBeenCalledWith(`/users?$filter=mail eq '${student.email}'`)
        expect(postMock).toHaveBeenCalledTimes(3);
        expect(postMock).toHaveBeenNthCalledWith(1, {
            addLicenses: [],
            removeLicenses: [Object.values(licenses)[0]]
        });
        expect(postMock).toHaveBeenNthCalledWith(2, {
            addLicenses: [],
            removeLicenses: [Object.values(licenses)[1]]
        });
        expect(postMock).toHaveBeenNthCalledWith(3, {
            addLicenses: [],
            removeLicenses: [Object.values(licenses)[2]]
        });
        expect(sleepMock).toHaveBeenCalledTimes(3);
        expect(sleepMock).toHaveBeenCalledWith(2000);
    });

    it("should skip licenses that the student dows not have", async () => {
        const sleepMock = vi.fn().mockResolvedValue(undefined);
        
        postMock.mockResolvedValueOnce({}).mockRejectedValueOnce(
            new Error("User does not have a corresponding license")
        );
    
        await processStudent(
            jobId,
            student,
            credentials,
            sleepMock,
            undefined
        );
        
        expect(postMock).toHaveBeenCalledTimes(3);
        expect(sendLogUpdate).toHaveBeenCalledWith(jobId, expect.stringContaining("missing"), "warn");
        expect(sleepMock).toHaveBeenCalledTimes(2);
    });

    it("should throw when Graph returns an unexpected error", async () => {
        const sleepMock = vi.fn().mockResolvedValueOnce(undefined);
        
        postMock.mockRejectedValueOnce(
            new Error("Internal Server Error")
        );
        
        await expect(processStudent(
            jobId,
            student,
            credentials,
            sleepMock,
            undefined
        )).rejects.toThrow("Internal Server Error");
    
        expect(sendLogUpdate).toHaveBeenCalledWith(jobId, `Failed to process student "${student.email}"`, "error");
    });

    it("should throw when the student cannot be found", async () => {
        const sleepMock = vi.fn().mockResolvedValue(undefined);
        
        getMock.mockResolvedValueOnce({
            value: []
        });

        await expect(processStudent(
            "job-1",
            student,
            credentials,
            sleepMock,
            undefined
        )).rejects.toThrow(`Student ${student.email} was not found in Microsoft Graph`);

        expect(getMock).toHaveBeenCalledTimes(1);
        expect(postMock).not.toHaveBeenCalled();
    });
});