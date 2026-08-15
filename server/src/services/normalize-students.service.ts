import { type NormalizedStudent } from "../types";

function normalizeStudents(studentList: Array<{ "ID's": string, "Email Address": string }>): NormalizedStudent[] {
    return studentList.map(s => ({
        id: s["ID's"],
        email: s["Email Address"],
        status: "pending"
    }));
}

export default normalizeStudents;