import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

// Mock user database - in a real app, this would be a database
const users = [
    {
        id: "1",
        email: "admin@example.com",
        // In a real app, this would be a hashed password
        password: "admin123",
        role: "admin",
        name: "Admin User",
    },
];

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();

    // Find the user
    const user = users.find(
        (u) => u.email === email && u.password === password
    );

    if (!user) {
        return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
        );
    }

    // Create a session (in a real app, this would be a JWT or other secure token)
    const session = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
    };

    // Set the session cookie
    //@ts-ignore
    cookies().set({
        name: "session",
        value: btoa(JSON.stringify(session)),
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({ success: true });
}
