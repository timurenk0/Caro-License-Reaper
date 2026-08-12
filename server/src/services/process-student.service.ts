import { NormalizedStudent } from "../types";

export default async function processStudent(student: NormalizedStudent) {
    try {
        await new Promise(res => setTimeout(res, 1000));
        console.log(student.email, "processed!");
    } catch (error) {
        throw error;
    }
}