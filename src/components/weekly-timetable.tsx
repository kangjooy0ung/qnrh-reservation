"use client";

import { useEffect, useMemo, useState } from "react";
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

type Selection =
  | { type: "create"; day: TimetableDay; slots: TimetableSlot[] }
  | { type: "cancel"; day: TimetableDay; slot: TimetableSlot; reservation: TimetableReservation };

type DragState = {
  dayIso: string;
  anchorIndex: number;
  currentIndex: number;
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
  const [selected, setSelected] = useState<Selection | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const reservationMap = useMemo(() => {
    const map = new Map<string, TimetableReservation>();
    for (const r of reservations) {
      map.set(`${r.reservation_date}__${r.time_slot_id}`, r);
    }
    return map;
  }, [reservations]);

  // 요일별로 각 교시(index)가 새 예약 선택에 포함될 수 있는지(예약 없음 + 마감 아님) 미리 계산
  const availabilityByDay = useMemo(() => {
    const map = new Map<string, boolean[]>();
    for (const day of weekDays) {
      map.set(
        day.iso,
        timeSlots.map((slot) => {
          const reservation = reservationMap.get(`${day.iso}__${slot.id}`);
          const disabled = day.isPast && !reservation;
          return !reservation && !disabled;
        })
      );
    }
    return map;
  }, [weekDays, timeSlots, reservationMap]);

  useEffect(() => {
    if (!drag) return;

    function resolveCell(clientX: number, clientY: number) {
      const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      return el?.closest<HTMLElement>("[data-cell='1']") ?? null;
    }

    function extendDrag(clientX: number, clientY: number) {
      const current = drag;
      if (!current) return;
      const cell = resolveCell(clientX, clientY);
      if (!cell) return;
      const dayIso = cell.dataset.day;
      if (dayIso !== current.dayIso) return;
      const targetIndex = Number(cell.dataset.slotIndex);
      if (Number.isNaN(targetIndex)) return;

      const availability = availabilityByDay.get(current.dayIso) ?? [];
      const dir = targetIndex >= current.anchorIndex ? 1 : -1;
      let end = current.anchorIndex;
      for (
        let i = current.anchorIndex;
        dir > 0 ? i <= targetIndex : i >= targetIndex;
        i += dir
      ) {
        if (!availability[i]) break;
        end = i;
      }
      if (end !== current.currentIndex) {
        setDrag({ ...current, currentIndex: end });
      }
    }

    function handlePointerMove(e: PointerEvent) {
      extendDrag(e.clientX, e.clientY);
    }

    function handlePointerUp() {
      const current = drag;
      if (current) {
        const day = weekDays.find((d) => d.iso === current.dayIso);
        if (day) {
          const from = Math.min(current.anchorIndex, current.currentIndex);
          const to = Math.max(current.anchorIndex, current.currentIndex);
          const slots = timeSlots.slice(from, to + 1);
          if (slots.length > 0) {
            setSelected({ type: "create", day, slots });
          }
        }
      }
      setDrag(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [drag, availabilityByDay, weekDays, timeSlots]);

  function handleCellPointerDown(
    day: TimetableDay,
    slot: TimetableSlot,
    slotIndex: number,
    reservation: TimetableReservation | null,
    disabled: boolean
  ) {
    if (reservation) {
      setSelected({ type: "cancel", day, slot, reservation });
      return;
    }
    if (disabled) return;
    setDrag({ dayIso: day.iso, anchorIndex: slotIndex, currentIndex: slotIndex });
  }

  return (
    <>
      <div
        className={`overflow-x-auto rounded-2xl border border-slate-200 bg-white ${
          drag ? "select-none" : ""
        }`}
      >
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
                    day.isToday ? "text-emerald-600" : "text-slate-500"
                  }`}
                >
                  <div>{day.label}</div>
                  <div className="font-normal text-slate-400">{day.monthDay}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, slotIndex) => (
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
                  const inDrag =
                    drag &&
                    drag.dayIso === day.iso &&
                    slotIndex >= Math.min(drag.anchorIndex, drag.currentIndex) &&
                    slotIndex <= Math.max(drag.anchorIndex, drag.currentIndex);

                  if (reservation) {
                    return (
                      <td key={day.iso} className="px-1.5 py-1.5 align-top">
                        <button
                          type="button"
                          data-cell="1"
                          data-day={day.iso}
                          data-slot-index={slotIndex}
                          data-available="false"
                          onPointerDown={() =>
                            handleCellPointerDown(day, slot, slotIndex, reservation, disabled)
                          }
                          style={{ touchAction: "none" }}
                          className="w-full rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-2 text-left transition hover:bg-emerald-100"
                        >
                          <p className="truncate text-xs font-semibold text-emerald-700">
                            {reservation.teacher_name}
                          </p>
                          {reservation.purpose && (
                            <p className="truncate text-[11px] text-emerald-500">
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
                        data-cell="1"
                        data-day={day.iso}
                        data-slot-index={slotIndex}
                        data-available={disabled ? "false" : "true"}
                        disabled={disabled}
                        onPointerDown={() =>
                          handleCellPointerDown(day, slot, slotIndex, null, disabled)
                        }
                        style={{ touchAction: "none" }}
                        className={`w-full rounded-lg border border-dashed px-2 py-2 text-center text-[11px] transition ${
                          disabled
                            ? "cursor-not-allowed border-slate-100 text-slate-300"
                            : inDrag
                              ? "border-emerald-400 bg-emerald-100 text-emerald-600"
                              : "border-slate-200 text-slate-400 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-500"
                        }`}
                      >
                        {disabled ? "마감" : inDrag ? "선택됨" : "예약 가능"}
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
          (클릭 또는 드래그로 여러 교시 선택)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-100 border border-emerald-200" /> 예약 완료
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-slate-100" /> 마감(지난 날짜)
        </span>
      </div>

      {selected && selected.type === "create" && (
        <ReservationModal
          facilityId={facilityId}
          facilityName={facilityName}
          day={selected.day}
          slots={selected.slots}
          reservation={null}
          onClose={() => setSelected(null)}
        />
      )}
      {selected && selected.type === "cancel" && (
        <ReservationModal
          facilityId={facilityId}
          facilityName={facilityName}
          day={selected.day}
          slots={[selected.slot]}
          reservation={selected.reservation}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
