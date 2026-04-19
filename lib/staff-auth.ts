import { cookies } from "next/headers";

export const STAFF_COOKIE_NAME = "donatesmart_staff_session";

export function getStaffCredentials() {
  return {
    id: process.env.STAFF_LOGIN_ID || "ghost",
    password: process.env.STAFF_LOGIN_PASSWORD || "12345"
  };
}

export function isValidStaffLogin(id: string, password: string) {
  const credentials = getStaffCredentials();
  return id === credentials.id && password === credentials.password;
}

export async function isStaffAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(STAFF_COOKIE_NAME)?.value === "authenticated";
}
