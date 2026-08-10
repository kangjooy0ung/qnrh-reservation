import Link from "next/link";
import { getNotices } from "@/lib/data/notices";
import { deleteNotice } from "@/app/actions/admin-actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
  const notices = await getNotices();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">공지사항 관리</h1>
          <p className="mt-1 text-sm text-slate-500">선생님들에게 보여줄 공지사항을 관리합니다.</p>
        </div>
        <Link
          href="/admin/notices/new"
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + 새 공지 작성
        </Link>
      </div>

      <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {notices.length === 0 ? (
          <p className="px-4 py-8 text-center text-slate-400">등록된 공지사항이 없습니다.</p>
        ) : (
          notices.map((n) => (
            <div key={n.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {n.is_pinned && (
                    <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600">
                      고정
                    </span>
                  )}
                  <p className="truncate font-medium text-slate-800">{n.title}</p>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  {new Date(n.created_at).toLocaleString("ko-KR")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/admin/notices/${n.id}`}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  수정
                </Link>
                <form action={deleteNotice}>
                  <input type="hidden" name="id" value={n.id} />
                  <ConfirmSubmitButton
                    message={`'${n.title}' 공지사항을 삭제할까요?`}
                    className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    삭제
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
