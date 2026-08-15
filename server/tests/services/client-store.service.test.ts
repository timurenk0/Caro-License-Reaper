import { describe, expect, it } from "vitest";
import {
    registerJob,
    takePendingJob,
    addClient,
    removeClient,
    sendJobUpdate
} from "../../src/services/client-store.service"
import type { NormalizedStudent } from "../../src/types";


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
        
    })
})