"use client";

import {
  Home,
  Search,
  LayoutGrid,
  Library,
  Heart,
  Plus,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useUIStore } from "@/store/useUIStore";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: LayoutGrid, label: "Browse", href: "/browse" },
  { icon: Library, label: "Library", href: "/library" },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex flex-col items-center py-6 w-[80px] h-full bg-[#0a0a0a] border-r border-[#1a1a1a] shrink-0 z-50 absolute md:relative transition-transform duration-300 md:translate-x-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)]",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex flex-col items-center gap-6 mb-8 mt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "p-3 rounded-2xl transition-all duration-200 group flex items-center justify-center",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-neutral-500 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-6 h-6",
                        isActive
                          ? "fill-white/20"
                          : "group-hover:fill-white/10 transition-colors",
                      )}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-neutral-800 text-white border-none"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="w-10 h-px bg-neutral-800 mb-8" />

        {/* Playlists & Collections */}
        <div className="flex flex-col items-center gap-4 flex-1 overflow-y-auto no-scrollbar w-full px-2 pb-4">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => toast("Liked Songs playlist opened")}
                className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-pink-500/20 shrink-0"
              >
                <Heart className="w-6 h-6 fill-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-neutral-800 text-white border-none"
            >
              Liked Songs
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => toast("Top Songs playlist opened")}
                className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-purple-500/20 shrink-0"
              >
                <span className="text-[10px] font-bold leading-tight text-center">
                  Top
                  <br />
                  Songs
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-neutral-800 text-white border-none"
            >
              Top Songs
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="mt-auto flex flex-col items-center gap-4 pt-4 shrink-0">
          <button
            onClick={() => toast("New playlist created")}
            className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => toast("Settings opened")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </aside>
    </>
  );
}
