import Link from "next/link";
import { getNotices } from "@/lib/data/notices";
import { NoticesList } from "@/components/admin/notices-list";

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

      <div className="mt-6">
        <NoticesList notices={notices} />
      </div>
    </div>
  );
}
