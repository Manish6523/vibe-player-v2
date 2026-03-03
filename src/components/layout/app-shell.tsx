"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { BottomPlayer } from "@/components/layout/bottom-player";
import { Menu, Music, Music2, Music3 } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

export function AppShell({ children }: { children: React.ReactNode }) {
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu);

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 shrink-0 bg-[#0a0a0a] border-b border-[#1a1a1a] z-50">
        <div className="flex items-center gap- cursor-pointer" onClick={()=>{window.location.href="/"}}>
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
