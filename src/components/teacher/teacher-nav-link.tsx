"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TeacherNavLink({
  href,
  exact,
  children,
}: {
  href: string;
  exact?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-amber-500 text-white" : "text-slate-500 hover:bg-amber-50 hover:text-amber-700"
      }`}
    >
      {children}
    </Link>
  );
}
