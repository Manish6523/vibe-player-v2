"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Maximize2,
  RefreshCw,
  Heart,
  ListMusic,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/usePlayerStore";
import Image from "next/image";
import { toast } from "sonner";

function formatTime(seconds: number) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function BottomPlayer({ className }: { className?: string }) {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    progress,
    duration,
    isShuffle,
    repeatMode,
    togglePlayPause,
    playNext,
    playPrevious,
    setVolume,
    toggleMute,
    setProgress,
    toggleShuffle,
    toggleRepeat,
    ytPlayerRef,
    likedSongs,
    toggleLikedSong,
  } = usePlayerStore();

  const handleSeek = (value: number[]) => {
    setProgress(value[0]);
    if (currentTrack?.source === "local") {
      const audioEl = document.querySelector("audio");
      if (audioEl && duration > 0) {
        audioEl.currentTime = (value[0] / 100) * duration;
      }
    } else if (currentTrack?.source === "youtube") {
      if (ytPlayerRef && duration > 0) {
        try {
          const seekTime = (value[0] / 100) * duration;
          ytPlayerRef.seekTo?.(seekTime, true);
        } catch (e) {}
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const currentSeconds = (progress / 100) * duration;

  return (
    <div
      className={cn(
        "h-24 bg-[#0a0a0a] border-t border-[#1a1a1a] flex items-center justify-between px-6 z-50",
        className,
      )}
    >
      {/* Track Info (Left) */}
      <div className="flex items-center gap-3 w-full md:w-[30%] md:min-w-[200px]">
        <div className="relative h-14 w-14 rounded-md overflow-hidden bg-neutral-900 group shrink-0">
          {currentTrack?.coverUrl ? (
            <Image
              src={currentTrack.coverUrl}
              alt="Cover Art"
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ListMusic className="h-6 w-6 text-neutral-700" />
            </div>
          )}
        </div>

        <div className="flex flex-col truncate max-w-[150px] md:max-w-[200px]">
          <span className="font-bold text-sm text-white truncate hover:underline cursor-pointer">
            {currentTrack?.title || "Vide Music"}
          </span>
          <span className="text-xs text-neutral-400 truncate hover:underline cursor-pointer">
            {currentTrack?.artist || "Next.js AI Player"}
          </span>
        </div>

        {currentTrack && currentTrack.source === "youtube" && (
          <button
            onClick={() => {
              toggleLikedSong(currentTrack);
              const isLiked = likedSongs.some((t) => t.id === currentTrack.id);
              toast(
                isLiked ? "Removed from Liked Songs" : "Saved to Liked Songs",
              );
            }}
            className="text-neutral-400 hover:text-white transition-colors ml-2 shrink-0"
          >
            <Heart
              className={`h-4 w-4 ${likedSongs.some((t) => t.id === currentTrack.id) ? "fill-red-500 text-red-500" : "fill-transparent"}`}
            />
          </button>
        )}
      </div>

      {/* Controls (Center) */}
      <div className="hidden md:flex flex-col items-center justify-center gap-2 max-w-[40%] w-full">
        <div className="flex items-center gap-6">
          <button
            onClick={toggleShuffle}
            className={cn(
              "transition-colors",
              isShuffle
                ? "text-white"
                : "text-neutral-500 hover:text-neutral-300",
            )}
          >
            <Shuffle className="h-4 w-4" />
          </button>
          <button
            onClick={playPrevious}
            className="text-neutral-100 hover:text-white transition-colors"
          >
            <SkipBack className="h-5 w-5" fill="currentColor" />
          </button>

          <button
            onClick={togglePlayPause}
            className="h-9 w-9 flex items-center justify-center rounded-sm bg-white text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" fill="currentColor" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
            )}
          </button>

          <button
            onClick={playNext}
            className="text-neutral-100 hover:text-white transition-colors"
          >
            <SkipForward className="h-5 w-5" fill="currentColor" />
          </button>
          <button
            onClick={toggleRepeat}
            className={cn(
              "transition-colors",
              repeatMode !== "off"
                ? "text-white"
                : "text-neutral-500 hover:text-neutral-300",
            )}
          >
            {repeatMode === "one" ? (
              <Repeat1 className="h-4 w-4" />
            ) : (
              <Repeat className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="text-[11px] text-neutral-400 font-medium tabular-nums min-w-[35px] text-right">
            {formatTime(currentSeconds)}
          </span>
          <div className="relative flex-1 group flex items-center h-4 cursor-pointer">
            <Slider
              value={[progress || 0]}
              max={100}
              step={0.1}
              onValueChange={handleSeek}
              disabled={!currentTrack}
              className="w-full relative z-10 
                  **:[[role=slider]]:h-3 **:[[role=slider]]:w-3 
                  **:[[role=slider]]:bg-white **:[[role=slider]]:border-white 
                  **:[[role=slider]]:shadow-none **:[[role=slider]]:opacity-100 group-hover:**:[[role=slider]]:opacity-100
                  **:data-[orientation=horizontal]:h-1 **:data-[orientation=horizontal]:bg-neutral-800
                  **:data-[orientation=horizontal]>div:bg-white"
            />
          </div>
          <span className="text-[11px] text-neutral-400 font-medium tabular-nums min-w-[35px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Utilities (Right) & Mobile simplified controls */}
      <div className="flex items-center justify-end gap-4 w-auto md:w-[30%] md:min-w-[200px]">
        {/* Mobile quick controls (Only shows on mobile) */}
        <div className="md:hidden flex items-center gap-3 mr-2">
          <button
            onClick={togglePlayPause}
            className="h-9 w-9 flex items-center justify-center rounded-sm bg-white text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" fill="currentColor" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
            )}
          </button>
          <button
            onClick={playNext}
            className="text-neutral-100 p-2 hover:text-white transition-colors"
          >
            <SkipForward className="h-5 w-5" fill="currentColor" />
          </button>
        </div>

        {/* Desktop Utilities */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => toast("Refreshing playback metadata")}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 w-28 group">
            <button
              onClick={toggleMute}
              className="text-neutral-400 hover:text-white transition-colors shrink-0"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-full opacity-70 group-hover:opacity-100 transition-opacity 
               **:[[role=slider]]:h-3 **:[[role=slider]]:w-3 **:[[role=slider]]:bg-white 
               **:[[role=slider]]:border-white **:[[role=slider]]:opacity-100 group-hover:**:[[role=slider]]:opacity-100
               **:data-[orientation=horizontal]:h-1 **:data-[orientation=horizontal]:bg-neutral-800
               **:data-[orientation=horizontal]>div:bg-white"
            />
          </div>

          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
                toast("Exited fullscreen mode");
              } else {
                document.documentElement.requestFullscreen();
                toast("Entered fullscreen mode");
              }
            }}
            className="text-neutral-400 hover:text-white transition-colors border-l border-neutral-800 pl-4 ml-2"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
