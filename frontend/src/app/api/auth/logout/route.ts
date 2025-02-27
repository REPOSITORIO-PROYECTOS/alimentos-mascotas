import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    // Clear the session cookie
    //@ts-ignore
    cookies().delete("session");

    // Redirect to the home page
    return NextResponse.redirect(
        new URL(
            "/",
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        )
    );
}
