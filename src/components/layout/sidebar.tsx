"use client";

import {
  Home,
  Search,
  LayoutGrid,
  Library,
  X,
  ChevronRight,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Library, label: "Collection", href: "/library" },
  { icon: LayoutGrid, label: "Browse", href: "/browse" },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  return (
    <>
      {/* Desktop Sidebar (Minimalist Vertical) */}
      <aside
        className={cn(
          "hidden md:flex flex-col items-center py-8 w-[80px] h-full bg-black border-r border-white/5 shrink-0 z-50",
          className,
        )}
      >
        <div className="flex flex-col gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "p-3 rounded-xl transition-all duration-300",
                pathname === item.href
                  ? "bg-white text-black"
                  : "text-neutral-600 hover:text-white",
              )}
            >
              <item.icon className="size-5" />
            </Link>
          ))}
        </div>
      </aside>

      {/* Mobile Hamburger Menu (Refined Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[90] md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-neutral-950 border-r border-white/10 z-[100] md:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black tracking-[0.3em] text-white">
                  MENU
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="text-neutral-500 size-5" />
                </button>
              </div>

              {/* Navigation List */}
              <nav className="flex-1 p-4 flex flex-col gap-2">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group",
                        isActive
                          ? "bg-white text-black"
                          : "text-neutral-400 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon className="size-5" />
                        <span className="text-sm font-black uppercase tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight
                        className={cn(
                          "size-4 opacity-0 -translate-x-2 transition-all",
                          isActive
                            ? "opacity-100 translate-x-0"
                            : "group-hover:opacity-50 group-hover:translate-x-0",
                        )}
                      />
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="p-4 mt-auto">
                <div className="rounded-2xl bg-white p-4 flex items-center justify-between group transition-all duration-500 hover:bg-neutral-200">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Brand Identity Box */}
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-black flex items-center justify-center border border-black/10">
                      <span className="text-[10px] font-black text-white tracking-tighter italic">
                        v2
                      </span>
                    </div>

                    {/* App Metadata */}
                    <div className="flex flex-col min-w-0">
                      <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] truncate">
                        vive -v2
                      </p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-black animate-pulse" />
                        <p className="text-[8px] text-black/50 font-bold uppercase tracking-[0.2em]">
                          System Active
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Utility Action */}
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center text-black transition-colors">
                    <Settings className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
