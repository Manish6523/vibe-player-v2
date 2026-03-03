"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Loader2, Music, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function LyricsView() {
  const { currentTrack, progress, duration } = usePlayerStore();
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const currentTime = (progress / 100) * duration;

  // --- Logic: Lyric Fetching ---
  useEffect(() => {
    if (!currentTrack) return;
    const fetchLyrics = async () => {
      setLoading(true);
      try {
        let queryStr = `${currentTrack.title} ${currentTrack.artist}`;
        if (currentTrack.source === "youtube") {
          // Clean up YouTube specific noise that ruins lyrics searches
          let cleanTitle = currentTrack.title
            .replace(/ \(Official.*?\)/gi, "")
            .replace(/ \[Official.*?\]/gi, "")
            .replace(/ \(Lyric.*?\)/gi, "")
            .replace(/ \[Lyric.*?\]/gi, "")
            .replace(/ \.?official video\.?/gi, "")
            .replace(/ \.?lyric video\.?/gi, "")
            .replace(/ - Topic/gi, "");

          let cleanArtist = currentTrack.artist.replace(/ - Topic/gi, "");

          if (cleanTitle.includes("-")) {
            // Often "Artist - Title" format. LrcLib works best with just cleanTitle
            queryStr = cleanTitle;
          } else {
            queryStr = `${cleanTitle} ${cleanArtist}`;
          }
        }

        const query = encodeURIComponent(queryStr);
        const res = await fetch(`https://lrclib.net/api/search?q=${query}`);
        const data = await res.json();
        if (data?.[0]?.syncedLyrics) {
          const lines = data[0].syncedLyrics
            .split("\n")
            .map((line: string) => {
              const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
              return match
                ? {
                    time: parseInt(match[1]) * 60 + parseFloat(match[2]),
                    text: match[3].trim(),
                  }
                : null;
            })
            .filter(Boolean);
          setLyrics(lines);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLyrics();
  }, [currentTrack]);

  // --- Logic: Active Index ---
  const activeIndex = useMemo(() => {
    if (!lyrics) return -1;
    return lyrics.findLastIndex(
      (line) => line.time !== -1 && currentTime >= line.time,
    );
  }, [lyrics, currentTime]);

  // --- Unique UI: Kinetic Stage (Monochrome) ---
  if (!currentTrack) return <EmptyState />;
  if (loading) return <LoadingState />;

  return (
    <div className="relative h-full w-full overflow-hidden bg-black flex flex-col items-center justify-center">
      {/* Background Ambient Glow (Monochrome) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neutral-800 rounded-full blur-[150px] opacity-60" />
      </div>
      {/* The Kinetic Stage */}
      <div className="relative z-10 w-full max-w-4xl h-[400px] flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col items-center justify-center gap-6">
            {lyrics?.map((line, i) => {
              // Only render the current, previous, and next lines for focus and performance
              const isVisible = i >= activeIndex - 2 && i <= activeIndex + 2;
              if (!isVisible) return null;

              const distance = i - activeIndex;
              const isActive = i === activeIndex;

              return (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  animate={{
                    // Opacity falloff: active 100%, 1 away 60%, 2 away 20%
                    opacity: isActive
                      ? 1
                      : Math.max(0.1, 1 - Math.abs(distance) * 0.4),
                    y: distance * 25, // Increased vertical spacing for clarity
                    scale: isActive ? 1.05 : 0.95,
                    filter: isActive
                      ? "blur(0px)"
                      : `blur(${Math.abs(distance) * 2.5}px)`,
                  }}
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 22, // Slightly slower damping for a smoother, more deliberate feel
                    mass: 0.9,
                  }}
                  className={cn(
                    "text-center px-12 transition-colors duration-1000 select-none",
                    isActive
                      ? "text-white text-4xl md:text-7xl font-black tracking-tighter"
                      : "text-neutral-700 text-3xl md:text-4xl font-bold tracking-tight",
                  )}
                >
                  {line.text}
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Subcomponents (Monochrome Updates) ---

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-black text-neutral-700 animate-fade-in duration-500">
      <Music className="w-16 h-16 mb-6 opacity-10" />
      <p className="text-sm font-bold tracking-[0.2em] uppercase">
        Playback Pending
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-black">
      <div className="relative">
        {/* White spinner against black */}
        <Loader2 className="w-12 h-12 animate-spin text-neutral-700" />
        {/* Subtle white "glow" backdrop for the loader */}
        <div className="absolute inset-0 blur-2xl bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}
