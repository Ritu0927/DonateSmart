import { NextResponse } from "next/server";
import { isValidStaffLogin, STAFF_COOKIE_NAME } from "@/lib/staff-auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { id?: string; password?: string };
    const id = payload.id?.trim() || "";
    const password = payload.password || "";

    if (!isValidStaffLogin(id, password)) {
      return NextResponse.json(
        { error: "Invalid employee ID or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: STAFF_COOKIE_NAME,
      value: "authenticated",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
