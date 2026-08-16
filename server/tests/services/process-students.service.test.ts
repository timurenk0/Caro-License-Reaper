import { describe, expect, it, vi, beforeEach } from "vitest"
import { removeClient, sendJobUpdate, sendLogUpdate } from "../../src/services/client-store.service";
import { GraphCredentials, NormalizedStudent } from "../../src/types";
import processStudent from "../../src/services/process-student.service";
import { processStudents } from "../../src/services/process-students.service";


vi.mock("../../src/services/process-student.service", () => ({
    default: vi.fn()
}));

vi.mock("../../src/services/client-store.service", () => ({
    removeClient: vi.fn(),
    sendJobUpdate: vi.fn(),
    sendLogUpdate: vi.fn()
}));


describe("multiple students processing", () => {
    const jobId = "job-1";

    const credentials: GraphCredentials = {
        TENANT_ID: "test-tenant-id",
        CLIENT_ID: "test-client-id",
        CLIENT_SECRET: "test-client-secret"
    };

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
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should process all students successfully", async () => {
        vi.mocked(processStudent).mockResolvedValue(undefined);
    
        await processStudents(jobId, students, credentials);
        
        expect(processStudent).toHaveBeenCalledTimes(2);
        expect(processStudent).toHaveBeenNthCalledWith(1, jobId, students[0], credentials, expect.any(Function));
        expect(processStudent).toHaveBeenNthCalledWith(2, jobId, students[1], credentials, expect.any(Function));
    });

    it("should send processing and success updates for each student", async () => {
        vi.mocked(processStudent).mockResolvedValue(undefined);

        await processStudents(jobId, students, credentials);

        expect(sendJobUpdate).toHaveBeenCalledWith(jobId, {
            email: "student.first@gisma-student.com",
            status: "processing",
            message: "Processing student entry..."
        });
        expect(sendJobUpdate).toHaveBeenCalledWith(jobId, {
            email: "student.first@gisma-student.com",
            status: "success",
            message: "Licenses removed successfully"
        });
        expect(sendJobUpdate).toHaveBeenCalledWith(jobId, {
            email: "student.second@gisma-student.com",
            status: "processing",
            message: "Processing student entry..."
        });
        expect(sendJobUpdate).toHaveBeenCalledWith(jobId, {
            email: "student.second@gisma-student.com",
            status: "success",
            message: "Licenses removed successfully"
        });
    });

    it("should send a processing update before processing each student", async () => {
        vi.mocked(processStudent).mockResolvedValue(undefined);

        await processStudents(
            jobId,
            students,
            credentials
        );

        expect(sendJobUpdate).toHaveBeenCalledWith(
            jobId,
            {
                email: students[0].email,
                status: "processing",
                message: "Processing student entry..."
            }
        );

        expect(sendJobUpdate).toHaveBeenCalledWith(
            jobId,
            {
                email: students[1].email,
                status: "processing",
                message: "Processing student entry..."
            }
        );
    });


    it("should send a success update when a student is processed successfully", async () => {
        vi.mocked(processStudent).mockResolvedValue(undefined);

        await processStudents(
            jobId,
            [students[0]],
            credentials
        );

        expect(sendJobUpdate).toHaveBeenCalledWith(
            jobId,
            {
                email: students[0].email,
                status: "success",
                message: "Licenses removed successfully"
            }
        );
    });

    it("should send an error update when a student fails", async () => {
        vi.mocked(processStudent).mockRejectedValueOnce(
            new Error("Graph API failed")
        );

        await processStudents(
            jobId,
            [students[0]],
            credentials
        );

        expect(sendJobUpdate).toHaveBeenCalledWith(
            jobId,
            {
                email: students[0].email,
                status: "error",
                message: "Graph API failed"
            }
        );
    });

    it("should continue processing when a student fails", async () => {
        vi.mocked(processStudent).mockRejectedValueOnce(new Error("Graph API failed")).mockResolvedValueOnce(undefined);

        await processStudents(jobId, students, credentials);

        expect(processStudent).toHaveBeenCalledTimes(2);
        expect(sendJobUpdate).toHaveBeenCalledWith(jobId, {
            email: students[0].email,
            status: "error",
            message: "Graph API failed"
        });
        expect(sendJobUpdate).toHaveBeenCalledWith(jobId, {
            email: students[1].email,
            status: "success",
            message: "Licenses removed successfully"
        });
    });

    it("should handle non-Error failures", async () => {
        vi.mocked(processStudent).mockRejectedValueOnce("something went wrong");

        await processStudents(jobId, [students[0]], credentials);

        expect(sendJobUpdate).toHaveBeenCalledWith(jobId, {
            email: "student.first@gisma-student.com",
            status: "error",
            message: "Unknown error"
        });
    });

    it("should send the completion update only once after all students are processed", async () => {
        vi.mocked(processStudent).mockResolvedValue(undefined);

        await processStudents(
            jobId,
            students,
            credentials
        );

        expect(sendJobUpdate).toHaveBeenCalledWith(
            jobId,
            {
                type: "complete"
            }
        );

        const completeCalls = vi.mocked(sendJobUpdate)
            .mock.calls
            .filter(([, update]) => update.type === "complete");

        expect(completeCalls).toHaveLength(1);
    });
    
    it("should remove the client after processing each student", async () => {
        vi.mocked(processStudent).mockResolvedValue(undefined);

        await processStudents(jobId, students, credentials);

        expect(removeClient).toHaveBeenCalledTimes(1);
        expect(removeClient).toHaveBeenCalledWith(jobId);
    });

    it("should remove the client even when processing a student fails", async () => {
        vi.mocked(processStudent).mockRejectedValueOnce(
            new Error("Graph API failed")
        );

        await processStudents(
            jobId,
            [students[0]],
            credentials
        );

        expect(removeClient).toHaveBeenCalledTimes(1);
        expect(removeClient).toHaveBeenCalledWith(jobId);
    });

    it("should process students sequentially", async () => {
        const order: string[] = [];

        vi.mocked(processStudent).mockImplementation(
            async (_, student) => {
                order.push(`start-${student.email}`);

                await Promise.resolve();

                order.push(`finish-${student.email}`);
            }
        );

        await processStudents(
            jobId,
            students,
            credentials
        );

        expect(order).toEqual([
            `start-${students[0].email}`,
            `finish-${students[0].email}`,
            `start-${students[1].email}`,
            `finish-${students[1].email}`
        ]);
    });
});