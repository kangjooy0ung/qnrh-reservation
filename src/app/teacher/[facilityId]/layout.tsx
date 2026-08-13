import { notFound } from "next/navigation";
import Link from "next/link";
import { getFacility } from "@/lib/data/facilities";
import { teacherLogout } from "@/app/actions/teacher-actions";
import { TeacherNavLink } from "@/components/teacher/teacher-nav-link";

export default async function TeacherFacilityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  const facility = await getFacility(facilityId);
  if (!facility) notFound();

  const base = `/teacher/${facilityId}`;
  const navItems = [
    { href: base, label: "홈", icon: "🏠", exact: true },
    ...(facility.requires_approval
      ? [{ href: `${base}/time-slots`, label: "교시 관리", icon: "🕐" }]
      : []),
    { href: `${base}/block`, label: "사용 제한", icon: "🚫" },
    { href: `${base}/rejections`, label: "반려 내역", icon: "ℹ️" },
    { href: `${base}/stats`, label: "누적 대여시간", icon: "📊" },
    { href: `${base}/notice`, label: "공지 메모", icon: "📌" },
    { href: `${base}/password`, label: "비밀번호 변경", icon: "🔑" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white sm:flex sm:flex-col">
        <Link href={base} className="flex items-center gap-2 border-b border-slate-100 px-5 py-5">
          <span className="text-xl leading-none">{facility.icon}</span>
          <span className="truncate text-sm font-bold text-slate-900">{facility.name}</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <TeacherNavLink key={item.href} href={item.href} exact={item.exact}>
              <span>{item.icon}</span>
              {item.label}
            </TeacherNavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            ← 예약 페이지로 이동
          </Link>
          <form action={teacherLogout}>
            <button
              type="submit"
              className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-red-500 hover:bg-red-50"
            >
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="border-b border-slate-200 bg-white sm:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span>{facility.icon}</span>
              {facility.name}
            </span>
            <form action={teacherLogout}>
              <button type="submit" className="text-xs font-medium text-red-500">
                로그아웃
              </button>
            </form>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
            {navItems.map((item) => (
              <TeacherNavLink key={item.href} href={item.href} exact={item.exact}>
                <span className="whitespace-nowrap">
                  {item.icon} {item.label}
                </span>
              </TeacherNavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
