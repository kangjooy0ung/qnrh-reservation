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
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <svg viewBox="0 0 32 32" className="h-9 w-9 shrink-0" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#059669" />
            <path d="M16 6.5 6.5 15h19z" fill="#ffffff" />
            <rect x="7.5" y="15" width="17" height="10.5" rx="1" fill="#ffffff" />
            <rect x="9.5" y="17.5" width="3" height="3" rx="0.6" fill="#059669" />
            <rect x="19.5" y="17.5" width="3" height="3" rx="0.6" fill="#059669" />
            <rect x="14" y="20" width="4" height="5.5" rx="0.6" fill="#059669" />
          </svg>
          <span className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold text-slate-600">부평고</span>
            <span className="text-xl font-extrabold tracking-tight text-black">예약콕</span>
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
