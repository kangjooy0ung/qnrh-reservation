import Link from "next/link";
import { getFacilities } from "@/lib/data/facilities";
import { getNotices } from "@/lib/data/notices";

export const dynamic = "force-dynamic";

const STEPS = [
  { title: "시설 선택", desc: "예약할 시설(강당, 체육관, 특별실 등)을 골라주세요." },
  { title: "요일·교시 선택", desc: "주간 시간표에서 비어 있는 칸을 클릭하세요." },
  { title: "이름 입력 후 예약", desc: "성함과 사용 목적을 입력하면 바로 예약이 확정됩니다." },
];

export default async function HomePage() {
  const [facilities, notices] = await Promise.all([getFacilities(), getNotices()]);
  const topFacilities = facilities.slice(0, 6);
  const topNotices = notices.slice(0, 3);

  return (
    <div className="flex flex-col gap-14">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-14 text-white sm:px-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
          Teacher Only · 선생님 전용
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          학교 시설, 로그인 없이
          <br />
          빠르게 예약하세요.
        </h1>
        <p className="mt-4 max-w-xl text-blue-100">
          강당·체육관·특별실 등 교내 시설을 요일·교시 단위로 확인하고, 이름만 입력하면 바로 예약할
          수 있습니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/facilities"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
          >
            시설 예약하기
          </Link>
          <Link
            href="/reservations"
            className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            내 예약 확인
          </Link>
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
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
          <Link href="/facilities" className="text-sm font-medium text-blue-600 hover:underline">
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
          <Link href="/notices" className="text-sm font-medium text-blue-600 hover:underline">
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
