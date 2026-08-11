import { getAllReservations } from "@/lib/data/reservations";
import { getFacilities } from "@/lib/data/facilities";
import { ReservationsTable } from "@/components/admin/reservations-table";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ facility?: string; status?: string; from?: string; to?: string }>;
}) {
  const { facility, status, from, to } = await searchParams;
  const facilities = await getFacilities({ includeInactive: true });

  const reservations = await getAllReservations({
    facilityId: facility || undefined,
    status: (status as "confirmed" | "pending" | "cancelled" | "all") || "confirmed",
    from: from || undefined,
    to: to || undefined,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">예약 관리</h1>
      <p className="mt-1 text-sm text-slate-500">전체 예약 내역을 조회하고 필요 시 취소합니다.</p>

      <form className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <Field label="시설">
          <select name="facility" defaultValue={facility ?? ""} className="input">
            <option value="">전체</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="상태">
          <select name="status" defaultValue={status ?? "confirmed"} className="input">
            <option value="confirmed">예약중</option>
            <option value="pending">승인대기</option>
            <option value="cancelled">취소됨</option>
            <option value="all">전체</option>
          </select>
        </Field>
        <Field label="시작일">
          <input type="date" name="from" defaultValue={from ?? ""} className="input" />
        </Field>
        <Field label="종료일">
          <input type="date" name="to" defaultValue={to ?? ""} className="input" />
        </Field>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          조회
        </button>
      </form>

      <div className="mt-6">
        <ReservationsTable reservations={reservations} />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      {children}
    </label>
  );
}
