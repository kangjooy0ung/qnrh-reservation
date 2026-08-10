import Link from "next/link";
import { notFound } from "next/navigation";
import { getTimeSlots } from "@/lib/data/time-slots";
import { TimeSlotForm } from "@/components/admin/time-slot-form";

export const dynamic = "force-dynamic";

export default async function EditTimeSlotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const slots = await getTimeSlots({ includeInactive: true });
  const timeSlot = slots.find((s) => s.id === id);
  if (!timeSlot) notFound();

  return (
    <div>
      <Link href="/admin/settings" className="text-sm font-medium text-blue-600 hover:underline">
        ← 운영 설정
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">교시 수정</h1>

      <div className="mt-6 max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
        <TimeSlotForm timeSlot={timeSlot} />
      </div>
    </div>
  );
}
