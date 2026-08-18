import Link from "next/link";
import { getFacilities } from "@/lib/data/facilities";
import { getNotices } from "@/lib/data/notices";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [facilities, notices] = await Promise.all([getFacilities(), getNotices()]);
  const topFacilities = facilities.slice(0, 6);
  const topNotices = notices.slice(0, 3);

  const exampleNames = facilities.slice(0, 3).map((f) => f.name);
  const exampleList = exampleNames.length > 0 ? exampleNames.join(", ") : "강당, 체육관, 특별실";
  const exampleListDot = exampleNames.length > 0 ? exampleNames.join("·") : "강당·체육관·특별실";

  const steps = [
    { title: "시설 선택", desc: `예약할 시설(${exampleList} 등)을 골라주세요.` },
    { title: "요일·교시 선택", desc: "주간 시간표에서 비어 있는 칸을 클릭하세요." },
    { title: "이름 입력 후 예약", desc: "성함과 사용 목적을 입력해 신청하면 담당 선생님 승인 후 예약이 확정됩니다." },
  ];

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
            교사용 시설 예약 시스템
          </p>
          <h1 className="mt-1.5 text-xl font-bold sm:text-2xl">교내 시설 예약</h1>
          <p className="mt-1.5 text-sm text-emerald-100">
            {exampleListDot} 등을 사용하실 선생님은 요일·교시를 선택해 예약해 주세요.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/facilities"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            시설 예약하기
          </Link>
          <Link
            href="/reservations"
            className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            내 예약 확인
          </Link>
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-900">예약 가능한 시설</h2>
          <Link href="/facilities" className="text-sm font-medium text-emerald-600 hover:underline">
            전체 보기 →
          </Link>
        </div>
        {topFacilities.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
            등록된 시설이 없습니다. 관리자 페이지에서 시설을 추가해 주세요.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topFacilities.map((facility) => (
              <Link
                key={facility.id}
                href={`/facilities/${facility.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none" aria-hidden="true">
                    {facility.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-emerald-700">
                      {facility.name}
                    </p>
                    <p className="text-xs text-slate-400">{facility.location ?? facility.category}</p>
                  </div>
                </div>
                {facility.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-500">{facility.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-900">공지사항</h2>
          <Link href="/notices" className="text-sm font-medium text-emerald-600 hover:underline">
            전체 보기 →
          </Link>
        </div>
        {topNotices.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
            등록된 공지사항이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {topNotices.map((notice) => (
              <li key={notice.id}>
                <Link
                  href={`/notices/${notice.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2 truncate">
                    {notice.is_pinned && (
                      <span className="shrink-0 rounded bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600">
                        공지
                      </span>
                    )}
                    <span className="truncate text-sm font-medium text-slate-800">
                      {notice.title}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
