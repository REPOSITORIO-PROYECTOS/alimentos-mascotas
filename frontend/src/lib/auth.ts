"use server";

import { cookies } from "next/headers";

// Mock session type
type Session = {
    id: string;
    email: string;
    role: string;
    name: string;
};

// Server-side function to get the current session
export async function getSession(): Promise<Session | null> {
    //@ts-ignore
    const sessionCookie = cookies().get("session");

    if (!sessionCookie) {
        return null;
    }

    try {
        // In a real app, you would verify the session token
        // This is a simplified example
        const sessionData = JSON.parse(atob(sessionCookie.value));
        return sessionData;
    } catch (error) {
        return null;
    }
}
