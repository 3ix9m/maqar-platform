import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div
        className={`relative mx-auto min-h-screen bg-background pb-24 ${
          wide ? "max-w-6xl" : "max-w-md"
        }`}
      >
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
