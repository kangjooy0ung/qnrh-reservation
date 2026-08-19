import Link from "next/link";
import { getFacilities } from "@/lib/data/facilities";
import type { Facility } from "@/lib/types";

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

  const instantFacilities = filtered.filter((f) => !f.requires_approval);
  const approvalFacilities = filtered.filter((f) => f.requires_approval);

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
                active ? "bg-emerald-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
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
        <div className="flex flex-col gap-10">
          <section>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                승인 없이
              </span>
              <h2 className="text-lg font-bold text-slate-900">바로 예약 가능한 시설</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              선착순으로 신청하면 즉시 예약이 확정됩니다. 별도 승인 절차가 없습니다.
            </p>
            {instantFacilities.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                해당 카테고리에 바로 예약 가능한 시설이 없습니다.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {instantFacilities.map((facility) => (
                  <FacilityCard key={facility.id} facility={facility} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                승인 필요
              </span>
              <h2 className="text-lg font-bold text-slate-900">승인이 필요한 시설</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              신청 후 담당 선생님의 승인을 받아야 예약이 확정됩니다. 같은 시간에 여러 명이 신청할
              수 있습니다.
            </p>
            {approvalFacilities.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                해당 카테고리에 승인이 필요한 시설이 없습니다.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {approvalFacilities.map((facility) => (
                  <FacilityCard key={facility.id} facility={facility} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/facilities/${facility.id}/calendar`}
        title="월별 예약 현황 보기"
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-emerald-600"
      >
        📅
      </Link>
      <Link href={`/facilities/${facility.id}`} className="flex flex-col">
        <div className="flex items-center gap-3 pr-8">
          <span className="text-3xl leading-none" aria-hidden="true">
            {facility.icon}
          </span>
          <div>
            <p className="font-semibold text-slate-900 group-hover:text-emerald-700">
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
    </div>
  );
}
