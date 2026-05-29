import React from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  hideNav?: boolean;
  showBack?: boolean;
}

export function AppShell({ children, title, hideNav = false }: AppShellProps) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground mx-auto max-w-[480px] app-frame relative overflow-hidden flex flex-col">
      <TopBar title={title} />
      <main
        className="flex-1 overflow-y-auto pb-[76px] pt-0 px-3 scroll-smooth"
        style={{
          background: "linear-gradient(180deg, hsl(34 30% 92%) 0%, hsl(33 28% 88%) 100%)",
          backgroundImage: [
            "linear-gradient(180deg, hsl(34 30% 92%) 0%, hsl(33 28% 88%) 100%)",
            "radial-gradient(var(--paper-dot-color) 1.1px, transparent 1.1px)",
            "repeating-linear-gradient(45deg, rgba(140,90,20,0.028) 0px, rgba(140,90,20,0.028) 1px, transparent 1px, transparent 22px)",
            "repeating-linear-gradient(-45deg, rgba(140,90,20,0.022) 0px, rgba(140,90,20,0.022) 1px, transparent 1px, transparent 22px)",
          ].join(", "),
          backgroundSize: "100% 100%, 18px 18px, 100% 100%, 100% 100%",
        }}
      >
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
