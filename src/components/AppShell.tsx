import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div
        className={`relative mx-auto min-h-screen bg-background pb-24 md:pb-10 ${
          wide
            ? "max-w-md sm:max-w-3xl lg:max-w-6xl xl:max-w-7xl"
            : "max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-5xl"
        }`}
      >
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
