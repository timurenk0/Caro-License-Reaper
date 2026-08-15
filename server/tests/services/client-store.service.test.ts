import { describe, expect, it, vi } from "vitest"
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
    it("should register and retrieve a pending job", () => {
        const students: NormalizedStudent[] = [
            {
                id: "GH0000001",
                email: "student.first@gisma-student.com",
                status: "pending"
            }
        ];

        registerJob("job-1", students);

        const result = takePendingJob("job-1");

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

        registerJob("job-1", students);

        takePendingJob("job-1");

        const result = takePendingJob("job-1");

        expect(result).toBeUndefined();
    });
});

describe("SSE client storage", () => {
    it("should send an update to a registered client", () => {
        const write = vi.fn();
        
        const response = { write } as any;
        addClient("job-1", response);

        sendJobUpdate("job-1", {
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

        addClient("job-1", response);

        removeClient("job-1");

        sendJobUpdate("job-1", {
            message: "should not arrive"
        });
        
        expect(write).not.toHaveBeenCalled();
    });

    it("should send a log update", () => {
        const write = vi.fn();

        const response = { write } as any;

        addClient("job-1", response);

        sendLogUpdate("job-1", "Licenses removed successfully", "success");

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