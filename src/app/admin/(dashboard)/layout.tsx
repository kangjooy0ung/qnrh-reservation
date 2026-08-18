import Link from "next/link";
import { adminLogout } from "@/app/actions/admin-actions";
import { AdminNavLink } from "@/components/admin-nav-link";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", icon: "📊" },
  { href: "/admin/reservations", label: "예약 관리", icon: "📅" },
  { href: "/admin/facilities", label: "시설 관리", icon: "🏫" },
  { href: "/admin/notices", label: "공지사항 관리", icon: "📢" },
  { href: "/admin/settings", label: "운영 설정", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white sm:flex sm:flex-col">
        <div className="border-b border-slate-100 px-5 py-5">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm text-white">
              🔐
            </span>
            <span className="text-sm font-bold text-slate-900">관리자 페이지</span>
          </Link>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← 예약 페이지로 이동
            </Link>
            <form action={adminLogout}>
              <button
                type="submit"
                className="w-full rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
            <AdminNavLink key={item.href} href={item.href}>
              <span>{item.icon}</span>
              {item.label}
            </AdminNavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="border-b border-slate-200 bg-white sm:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-bold text-slate-900">관리자 페이지</span>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                예약 페이지로
              </Link>
              <form action={adminLogout}>
                <button
                  type="submit"
                  className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  로그아웃
                </button>
              </form>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
            {NAV_ITEMS.map((item) => (
              <AdminNavLink key={item.href} href={item.href}>
                <span className="whitespace-nowrap">
                  {item.icon} {item.label}
                </span>
              </AdminNavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
