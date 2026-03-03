"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { BottomPlayer } from "@/components/layout/bottom-player";
import { Menu, Music, Music2, Music3 } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useState } from "react";
import { toast } from "sonner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu);
  const [clickCount, setClickCount] = useState(0);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 10) {
      setClickCount(0);
      const isVibe = localStorage.getItem("vibe") === "true";
      if (isVibe) {
        localStorage.removeItem("vibe");
        toast("Vibe mode disabled");
      } else {
        localStorage.setItem("vibe", "true");
        toast("Vibe mode enabled ✨");
      }
      // Force a small reload or state update so other components notice the change, or just let them pick it up on next render.
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 shrink-0 bg-[#0a0a0a] border-b border-[#1a1a1a] z-50">
        <div
          className="flex items-center gap- cursor-pointer select-none"
          onClick={handleLogoClick}
        >
          <Music2 className="size-6 text-red-500 -mr-4" />
          <Music3 className="size-6 text-red-400" />
          <span className="font-bold text-lg">Vibe V2</span>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p- text-neutral-400 hover:text-white cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-96px)] md:h-[calc(100vh-96px)] relative">
        <Sidebar className="shrink-0" />
        <div className="flex flex-col flex-1 overflow-hidden">{children}</div>
      </div>
      <BottomPlayer className="shrink-0" />
    </div>
  );
}
