"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <span className="text-4xl">⚠️</span>
      <h1 className="text-lg font-bold text-slate-900">문제가 발생했습니다</h1>
      <p className="max-w-md text-sm text-slate-500">
        {error.message || "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."}
      </p>
      <p className="max-w-md text-xs text-slate-400">
        Supabase 환경변수(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)가 올바르게 설정되어 있는지
        확인해 주세요.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        다시 시도
      </button>
    </div>
  );
}
