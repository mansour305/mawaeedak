/**
 * AppShell — Saudi Premium Minimal App Layout
 * Reference: docs/design-reference/final-2026/
 * 
 * Features:
 * - RTL layout
 * - Max width 480px (mobile-first)
 * - Ivory/sand background with gold accents
 * - Premium typography with Noto Sans Arabic
 * - TopBar header with notification bell
 * - Bottom navigation bar
 */

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
    <div
      dir="rtl"
      className="relative mx-auto flex min-h-[100dvh] max-w-[480px] flex-col overflow-hidden text-foreground"
      style={{
        background:
          "radial-gradient(circle at 12% 8%, rgba(201,160,99,0.13), transparent 28%), linear-gradient(180deg, #FAF7F2 0%, #FFFFFF 42%, #F3E8D6 100%)",
        color: "#2F2B25",
        fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif",
        boxShadow: "0 0 0 1px rgba(201,160,99,0.18), 0 24px 70px rgba(47,43,37,0.12)",
      }}
    >
      <TopBar title={title} showBack={showBack} />
      <main className="flex-1 overflow-y-auto px-4 pb-[104px] pt-2">{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
