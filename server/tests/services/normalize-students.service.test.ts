import { describe, expect, it } from "vitest"
import normalizeStudents from "../../src/services/normalize-students.service"


describe('normalizeStudents', () => {
    it("should normalize student data", () => {
        const input = [
            {
                "ID's": "GH0000001",
                "Email Address": "student.first@gisma-student.com"
            },
            {
                "ID's": "GH0000002",
                "Email Address": "student.second@gisma-student.com"
            }
        ];

        const result = normalizeStudents(input);

        expect(result).toEqual([
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
        ]);
    });

    it("should return an empty array when there are no students", () => {
        const result = normalizeStudents([]);
        
        expect(result).toEqual([]);
    });
})