export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 py-5 text-xs text-slate-400 sm:px-6">
        <span className="flex items-center gap-1.5 font-medium text-slate-500">
          <svg viewBox="0 0 32 32" className="h-4 w-4 shrink-0" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#059669" />
            <path d="M16 6.5 6.5 15h19z" fill="#ffffff" />
            <rect x="7.5" y="15" width="17" height="10.5" rx="1" fill="#ffffff" />
            <rect x="9.5" y="17.5" width="3" height="3" rx="0.6" fill="#059669" />
            <rect x="19.5" y="17.5" width="3" height="3" rx="0.6" fill="#059669" />
            <rect x="14" y="20" width="4" height="5.5" rx="0.6" fill="#059669" />
          </svg>
          부평고 예약콕
        </span>
        <span className="text-slate-200">|</span>
        <span>이용 중 문제가 있으면 정보교육부로 문의해 주세요.</span>
        <span className="text-slate-200">|</span>
        <span>© {year} 부평고 예약콕. All Rights Reserved.</span>
      </div>
    </footer>
  );
}
