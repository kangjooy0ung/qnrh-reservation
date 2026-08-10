import Link from "next/link";
import { notFound } from "next/navigation";
import { getNotice } from "@/lib/data/notices";
import { NoticeForm } from "@/components/admin/notice-form";

export const dynamic = "force-dynamic";

export default async function EditNoticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = await getNotice(id);
  if (!notice) notFound();

  return (
    <div>
      <Link href="/admin/notices" className="text-sm font-medium text-emerald-600 hover:underline">
        ← 공지사항 관리
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">공지 수정</h1>

      <div className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <NoticeForm notice={notice} />
      </div>
    </div>
  );
}
