export function TrustStrip(): JSX.Element {
  const items = [
    "PhilHealth-ready",
    "HMO Claims",
    "GCash / Maya",
    "Official Receipts",
    "Data Privacy Act-aware",
    "Asia/Manila"
  ];

  return (
    <div className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-3">
      {items.map((item) => (
        <span 
          key={item}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-500 shadow-sm transition-all hover:border-blue-200 hover:text-blue-600"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
