import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, TEACHER_COOKIE_NAME } from "@/lib/constants";
import { isValidAdminToken } from "@/lib/admin-auth";
import { isValidFacilitySessionToken, parseFacilitySessionCookie } from "@/lib/facility-admin-auth";

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

  // /teacher (facilityId 없음)는 페이지 컴포넌트가 쿠키를 읽어 적절히 리다이렉트합니다.
  if (pathname.startsWith("/teacher/")) {
    const facilityId = pathname.split("/")[2];
    const parsed = parseFacilitySessionCookie(request.cookies.get(TEACHER_COOKIE_NAME)?.value);
    const valid =
      !!facilityId &&
      parsed?.facilityId === facilityId &&
      (await isValidFacilitySessionToken(parsed.token, facilityId));
    if (!valid) {
      const loginUrl = new URL("/teacher/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*"],
};
