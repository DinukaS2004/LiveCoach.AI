import axios from "axios";

export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
    timeout: 15000,
});

// Added Firebase token as Bearer
export async function authHeaders(idToken: string) {
    return {
        Authorization: `Bearer ${idToken}`,
    };
}
