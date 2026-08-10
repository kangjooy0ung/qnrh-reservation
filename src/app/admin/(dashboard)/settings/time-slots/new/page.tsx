import Link from "next/link";
import { TimeSlotForm } from "@/components/admin/time-slot-form";

export default function NewTimeSlotPage() {
  return (
    <div>
      <Link href="/admin/settings" className="text-sm font-medium text-emerald-600 hover:underline">
        ← 운영 설정
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">교시 추가</h1>

      <div className="mt-6 max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
        <TimeSlotForm />
      </div>
    </div>
  );
}
