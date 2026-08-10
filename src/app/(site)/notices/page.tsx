import Link from "next/link";
import { getNotices } from "@/lib/data/notices";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const notices = await getNotices();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">공지사항</h1>
      <p className="mt-1 text-sm text-slate-500">시설 이용 관련 안내 및 공지사항입니다.</p>

      <div className="mt-6">
        {notices.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
            등록된 공지사항이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {notices.map((notice) => (
              <li key={notice.id}>
                <Link
                  href={`/notices/${notice.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
                >
                  <span className="flex min-w-0 items-center gap-2">
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
      </div>
    </div>
  );
}
