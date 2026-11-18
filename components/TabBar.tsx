export type Tab = "list" | "stats";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: "list",
    label: "明細",
    icon: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  },
  {
    key: "stats",
    label: "統計",
    icon: (
      <>
        <path d="M21.2 15.9A10 10 0 1 1 8 2.8" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </>
    ),
  },
];

export default function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="pb-safe flex border-t border-line bg-white px-6">
      {TABS.map(({ key, label, icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex flex-1 flex-col items-center gap-0.5 pt-2 text-[11px] font-medium transition ${
              active ? "text-brand-strong" : "text-gray-400"
            }`}
          >
            <span
              className={`flex h-7 w-14 items-center justify-center rounded-full transition ${
                active ? "bg-brand-soft" : ""
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={active ? 2.2 : 1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {icon}
              </svg>
            </span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}
