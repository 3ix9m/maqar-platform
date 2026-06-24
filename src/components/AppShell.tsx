import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="relative mx-auto min-h-screen max-w-md bg-background pb-24">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
