import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "drop_manager_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = formData.get("token");
  const secret = process.env.DROP_MANAGER_SECRET;

  if (secret && token === secret) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  redirect("/tools/context-drop");
}
