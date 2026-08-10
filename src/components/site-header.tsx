import Link from "next/link";
import { NavLink } from "@/components/nav-link";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/facilities", label: "시설예약" },
  { href: "/reservations", label: "내 예약 확인" },
  { href: "/notices", label: "공지사항" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg text-white">
            🏫
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900">
            부평고 예약콕 <span className="font-normal text-slate-400">| 시설예약</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link
          href="/admin/login"
          className="shrink-0 text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          관리자 로그인
        </Link>
      </div>
    </header>
  );
}
