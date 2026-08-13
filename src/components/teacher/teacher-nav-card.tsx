import Link from "next/link";

export function TeacherNavCard({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm"
    >
      <span className="text-2xl leading-none">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-900">{title}</p>
          {typeof badge === "number" && badge > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <span className="shrink-0 text-slate-300">→</span>
    </Link>
  );
}
