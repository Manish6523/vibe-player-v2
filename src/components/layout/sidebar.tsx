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
        <div className="flex flex-col items-center gap-4 mb-8 mt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "p-2 rounded-2xl transition-all duration-200 group flex items-center justify-center",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-neutral-500 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-5",
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
      </aside>
    </>
  );
}
