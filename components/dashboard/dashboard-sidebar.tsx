"use client";

import {
  CaretLeftIcon,
  ChatTeardropTextIcon,
  LightbulbIcon,
} from "@phosphor-icons/react";

type NavId = "new-chat" | "ideas";

type DashboardSidebarProps = {
  collapsed: boolean;
  active: NavId;
  onToggle: () => void;
  onSelect: (id: NavId) => void;
};

const NAV_ITEMS: {
  id: NavId;
  label: string;
  icon: typeof ChatTeardropTextIcon;
}[] = [
  { id: "new-chat", label: "New chat", icon: ChatTeardropTextIcon },
  { id: "ideas", label: "Ideas", icon: LightbulbIcon },
];

export function DashboardSidebar({
  collapsed,
  active,
  onToggle,
  onSelect,
}: DashboardSidebarProps) {
  return (
    <aside
      className={`
        relative flex h-full shrink-0 flex-col overflow-hidden rounded-2xl
        border border-white/10 bg-white/[0.03] backdrop-blur-3xl
        shadow-[0_8px_40px_rgba(0,0,0,0.28)]
        transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${collapsed ? "w-[65px]" : "w-[220px]"}
      `}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#d09a82]/50 to-transparent" />

      <div
        className={`flex items-center px-3 pt-4 pb-2 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed ? (
          <p className="px-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Workspace
          </p>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-9 items-center justify-center rounded-4xl border border-white/10 bg-white/[0.05] text-zinc-400 transition hover:bg-white/[0.1] hover:text-white"
        >
          <CaretLeftIcon
            aria-hidden="true"
            className={`size-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <nav className="flex flex-col gap-1.5 px-3 pt-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              type="button"
              title={collapsed ? item.label : undefined}
              onClick={() => onSelect(item.id)}
              className={`
                group flex h-11 items-center rounded-xl border transition-all duration-200
                ${collapsed ? "justify-center px-0" : "gap-3 px-3"}
                ${
                  isActive
                    ? "border-[#d09a82]/35 bg-[#d09a82]/15 text-[#e2b09b]"
                    : "border-transparent bg-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-zinc-100"
                }
              `}
            >
              <Icon aria-hidden="true" className="size-5 shrink-0" />
              <span
                className={`
                  overflow-hidden whitespace-nowrap font-sans text-sm font-medium 
                  transition-[max-width,opacity] duration-300
                  ${collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"}
                `}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
