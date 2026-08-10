"use client";

import { useMemo, useState } from "react";
import { ReservationModal } from "@/components/reservation-modal";

export type TimetableSlot = {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
};

export type TimetableDay = {
  iso: string;
  label: string;
  monthDay: string;
  isToday: boolean;
  isPast: boolean;
};

export type TimetableReservation = {
  id: string;
  reservation_date: string;
  time_slot_id: string;
  teacher_name: string;
  department: string | null;
  purpose: string | null;
};

type SelectedCell = {
  day: TimetableDay;
  slot: TimetableSlot;
  reservation: TimetableReservation | null;
};

export function WeeklyTimetable({
  facilityId,
  facilityName,
  timeSlots,
  weekDays,
  reservations,
}: {
  facilityId: string;
  facilityName: string;
  timeSlots: TimetableSlot[];
  weekDays: TimetableDay[];
  reservations: TimetableReservation[];
}) {
  const [selected, setSelected] = useState<SelectedCell | null>(null);

  const reservationMap = useMemo(() => {
    const map = new Map<string, TimetableReservation>();
    for (const r of reservations) {
      map.set(`${r.reservation_date}__${r.time_slot_id}`, r);
    }
    return map;
  }, [reservations]);

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-28 shrink-0 px-3 py-3 text-left text-xs font-semibold text-slate-400">
                교시
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.iso}
                  className={`px-3 py-3 text-center text-xs font-semibold ${
                    day.isToday ? "text-blue-600" : "text-slate-500"
                  }`}
                >
                  <div>{day.label}</div>
                  <div className="font-normal text-slate-400">{day.monthDay}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 align-top">
                  <div className="text-xs font-semibold text-slate-700">{slot.label}</div>
                  <div className="text-[11px] text-slate-400">
                    {slot.start_time}~{slot.end_time}
                  </div>
                </td>
                {weekDays.map((day) => {
                  const reservation = reservationMap.get(`${day.iso}__${slot.id}`) ?? null;
                  const disabled = day.isPast && !reservation;

                  if (reservation) {
                    return (
                      <td key={day.iso} className="px-1.5 py-1.5 align-top">
                        <button
                          type="button"
                          onClick={() => setSelected({ day, slot, reservation })}
                          className="w-full rounded-lg border border-blue-100 bg-blue-50 px-2 py-2 text-left transition hover:bg-blue-100"
                        >
                          <p className="truncate text-xs font-semibold text-blue-700">
                            {reservation.teacher_name}
                          </p>
                          {reservation.purpose && (
                            <p className="truncate text-[11px] text-blue-500">
                              {reservation.purpose}
                            </p>
                          )}
                        </button>
                      </td>
                    );
                  }

                  return (
                    <td key={day.iso} className="px-1.5 py-1.5 align-top">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelected({ day, slot, reservation: null })}
                        className={`w-full rounded-lg border border-dashed px-2 py-2 text-center text-[11px] transition ${
                          disabled
                            ? "cursor-not-allowed border-slate-100 text-slate-300"
                            : "border-slate-200 text-slate-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500"
                        }`}
                      >
                        {disabled ? "마감" : "예약 가능"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-dashed border-slate-300" /> 예약 가능
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-blue-100 border border-blue-200" /> 예약 완료
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-slate-100" /> 마감(지난 날짜)
        </span>
      </div>

      {selected && (
        <ReservationModal
          facilityId={facilityId}
          facilityName={facilityName}
          day={selected.day}
          slot={selected.slot}
          reservation={selected.reservation}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
