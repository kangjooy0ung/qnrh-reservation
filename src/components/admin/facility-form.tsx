"use client";

import { useActionState } from "react";
import { upsertFacility } from "@/app/actions/admin-actions";
import { initialActionState } from "@/lib/action-state";
import { FACILITY_CATEGORIES } from "@/lib/constants";
import type { Facility } from "@/lib/types";

export function FacilityForm({ facility }: { facility?: Facility }) {
  const [state, formAction, isPending] = useActionState(upsertFacility, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {facility && <input type="hidden" name="id" value={facility.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="시설명 *">
          <input
            name="name"
            required
            maxLength={50}
            defaultValue={facility?.name}
            className="input"
            placeholder="예: 대강당"
          />
        </Field>
        <Field label="카테고리">
          <select name="category" defaultValue={facility?.category ?? "기타"} className="input">
            {FACILITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="위치">
          <input
            name="location"
            maxLength={50}
            defaultValue={facility?.location ?? ""}
            className="input"
            placeholder="예: 본관 3층"
          />
        </Field>
        <Field label="수용 인원">
          <input
            type="number"
            min={0}
            name="capacity"
            defaultValue={facility?.capacity ?? ""}
            className="input"
            placeholder="예: 60"
          />
        </Field>
        <Field label="아이콘(이모지)">
          <input
            name="icon"
            maxLength={4}
            defaultValue={facility?.icon ?? "🏫"}
            className="input"
          />
        </Field>
        <Field label="색상">
          <input
            type="color"
            name="color"
            defaultValue={facility?.color ?? "#059669"}
            className="h-10 w-full rounded-lg border border-slate-200"
          />
        </Field>
        <Field label="정렬 순서(작을수록 먼저 표시)">
          <input
            type="number"
            name="sort_order"
            defaultValue={facility?.sort_order ?? 0}
            className="input"
          />
        </Field>
        <label className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-600">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={facility?.is_active ?? true}
            className="h-4 w-4 rounded border-slate-300"
          />
          예약 페이지에 노출 (운영 중)
        </label>
      </div>

      <Field label="설명">
        <textarea
          name="description"
          rows={3}
          defaultValue={facility?.description ?? ""}
          className="input"
          placeholder="시설에 대한 간단한 설명을 입력하세요"
        />
      </Field>

      {state.status === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {isPending ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </form>
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
