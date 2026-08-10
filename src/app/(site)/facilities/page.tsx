import Link from "next/link";
import { getFacilities } from "@/lib/data/facilities";

export const dynamic = "force-dynamic";

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const facilities = await getFacilities();
  const categories = ["전체", ...Array.from(new Set(facilities.map((f) => f.category)))];
  const filtered = category && category !== "전체"
    ? facilities.filter((f) => f.category === category)
    : facilities;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">시설 예약</h1>
        <p className="mt-1 text-sm text-slate-500">
          예약할 시설을 선택하면 주간 시간표에서 바로 예약할 수 있습니다.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = c === (category ?? "전체");
          return (
            <Link
              key={c}
              href={c === "전체" ? "/facilities" : `/facilities?category=${encodeURIComponent(c)}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
              } border border-slate-200`}
            >
              {c}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
          해당 카테고리에 시설이 없습니다.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((facility) => (
            <Link
              key={facility.id}
              href={`/facilities/${facility.id}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                  style={{ backgroundColor: `${facility.color}1a` }}
                >
                  {facility.icon}
                </span>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-blue-700">
                    {facility.name}
                  </p>
                  <span
                    className="mt-0.5 inline-block rounded px-1.5 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: `${facility.color}1a`, color: facility.color }}
                  >
                    {facility.category}
                  </span>
                </div>
              </div>
              {facility.description && (
                <p className="mt-3 line-clamp-2 text-sm text-slate-500">{facility.description}</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                {facility.location && <span>📍 {facility.location}</span>}
                {facility.capacity && <span>👥 {facility.capacity}명</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
