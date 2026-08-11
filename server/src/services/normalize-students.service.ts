import { type NormalizedStudent } from "../types";

function normalizeStudents(studentList: (any & { "Email Address": string })): NormalizedStudent[] {
    const students: NormalizedStudent[] = [];

    for (let s of studentList) {
        const normalizedStudent: NormalizedStudent = {
            id: s["ID's"],
            email: s["Email Address"],
            status: "pending"
        }

        students.push(normalizedStudent);
    }

    return students;
}

export default normalizeStudents;