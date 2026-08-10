import Link from "next/link";
import { NoticeForm } from "@/components/admin/notice-form";

export default function NewNoticePage() {
  return (
    <div>
      <Link href="/admin/notices" className="text-sm font-medium text-emerald-600 hover:underline">
        ← 공지사항 관리
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">새 공지 작성</h1>

      <div className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <NoticeForm />
      </div>
    </div>
  );
}
