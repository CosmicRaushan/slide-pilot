"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type DashboardSidebarState = {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
};

const DashboardSidebarStateContext =
  createContext<DashboardSidebarState | null>(null);

export function DashboardSidebarStateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <DashboardSidebarStateContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </DashboardSidebarStateContext.Provider>
  );
}

export function useDashboardSidebarState() {
  const state = useContext(DashboardSidebarStateContext);

  if (!state) {
    throw new Error(
      "useDashboardSidebarState must be used within DashboardSidebarStateProvider",
    );
  }

  return state;
}
