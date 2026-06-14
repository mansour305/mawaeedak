import React from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  hideNav?: boolean;
  showBack?: boolean;
}

export function AppShell({ children, title, hideNav = false, showBack = false }: AppShellProps) {
  return (
    <div dir="rtl" className="maw-device-stage">
      <div className="maw-app-shell maw-app-bg text-foreground">
        <TopBar title={title} showBack={showBack} />
        <main className="flex-1 overflow-y-auto px-4 pb-[104px] pt-3 no-scrollbar">{children}</main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
