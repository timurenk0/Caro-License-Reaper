import { beforeAll, describe, expect, it, vi } from "vitest"
import {
    registerJob,
    takePendingJob,
    addClient,
    removeClient,
    sendJobUpdate,
    sendLogUpdate
} from "../../src/services/client-store.service"
import type { NormalizedStudent } from "../../src/types"


describe("pending job storage", () => {
    const jobId = "job-1";

    beforeAll(() => {
        vi.clearAllMocks()
    });
    
    it("should register and retrieve a pending job", () => {
        const students: NormalizedStudent[] = [
            {
                id: "GH0000001",
                email: "student.first@gisma-student.com",
                status: "pending"
            }
        ];

        registerJob(jobId, students);

        const result = takePendingJob(jobId);

        expect(result).toEqual(students);
    });

    it("should remove a job after it is taken", () => {
        const students: NormalizedStudent[] = [
            {
                id: "GH0000001",
                email: "student.first@gisma-student.com",
                status: "pending"
            }
        ];

        registerJob(jobId, students);

        takePendingJob(jobId);

        const result = takePendingJob(jobId);

        expect(result).toBeUndefined();
    });
});

describe("SSE client storage", () => {
    const jobId = "job-1";

    beforeAll(() => {
        vi.clearAllMocks()
    });
    
    it("should send an update to a registered client", () => {
        const write = vi.fn();
        
        const response = { write } as any;
        addClient(jobId, response);

        sendJobUpdate(jobId, {
            type: "success",
            message: "License removed"
        });

        expect(write).toHaveBeenCalledWith(
            `data: ${JSON.stringify({
                type: "success",
                message: "License removed"
            })}\n\n`
        );
    });

    it("should not send an update when the client is not registered", () => {
        expect(() => {
            sendJobUpdate("unknown-job", {
                message: "hello"
            });
        }).not.toThrow();
    });

    it("should stop sending updates after a client is removed", () => {
        const write = vi.fn();

        const response = { write } as any;

        addClient(jobId, response);

        removeClient(jobId);

        sendJobUpdate(jobId, {
            message: "should not arrive"
        });
        
        expect(write).not.toHaveBeenCalled();
    });

    it("should send a log update", () => {
        const write = vi.fn();

        const response = { write } as any;

        addClient(jobId, response);

        sendLogUpdate(jobId, "Licenses removed successfully", "success");

        expect(write).toHaveBeenCalledTimes(1);

        const payload = write.mock.calls[0][0];

        const json = payload.replace(/^data: /, "").replace(/\n\n$/, "");

        expect(JSON.parse(json)).toMatchObject({
            type: "log",
            level: "success",
            message: "Licenses removed successfully"
        });
    })
})