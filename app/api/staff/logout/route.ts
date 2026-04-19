import { NextResponse } from "next/server";
import { STAFF_COOKIE_NAME } from "@/lib/staff-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: STAFF_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}
