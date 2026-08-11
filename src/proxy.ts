import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, TEACHER_COOKIE_NAME } from "@/lib/constants";
import { isValidAdminToken } from "@/lib/admin-auth";
import { isValidTeacherToken } from "@/lib/teacher-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!(await isValidAdminToken(token))) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === "/teacher/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/teacher")) {
    const token = request.cookies.get(TEACHER_COOKIE_NAME)?.value;
    if (!(await isValidTeacherToken(token))) {
      const loginUrl = new URL("/teacher/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*"],
};
