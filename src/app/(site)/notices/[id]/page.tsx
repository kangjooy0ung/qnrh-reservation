import Link from "next/link";
import { notFound } from "next/navigation";
import { getNotice } from "@/lib/data/notices";

export const dynamic = "force-dynamic";

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = await getNotice(id);
  if (!notice) notFound();

  return (
    <div>
      <Link href="/notices" className="text-sm font-medium text-emerald-600 hover:underline">
        ← 공지사항 목록
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          {notice.is_pinned && (
            <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600">
              공지
            </span>
          )}
          <h1 className="text-xl font-bold text-slate-900">{notice.title}</h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {new Date(notice.created_at).toLocaleString("ko-KR")}
        </p>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {notice.content}
        </p>
      </div>
    </div>
  );
}
