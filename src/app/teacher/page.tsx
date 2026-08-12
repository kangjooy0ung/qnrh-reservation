import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidFacilitySessionToken, parseFacilitySessionCookie, TEACHER_COOKIE_NAME } from "@/lib/facility-admin-auth";

export const dynamic = "force-dynamic";

export default async function TeacherRootPage() {
  const store = await cookies();
  const parsed = parseFacilitySessionCookie(store.get(TEACHER_COOKIE_NAME)?.value);
  if (parsed && (await isValidFacilitySessionToken(parsed.token, parsed.facilityId))) {
    redirect(`/teacher/${parsed.facilityId}`);
  }
  redirect("/teacher/login");
}
