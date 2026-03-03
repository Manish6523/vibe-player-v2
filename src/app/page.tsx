"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import Image from "next/image";
import {
  ListMusic,
  Play,
  Search,
  ChevronDown,
  Maximize2,
  Heart,
  MoreHorizontal,
  Loader2,
  Import,
} from "lucide-react";
import YouTube from "react-youtube";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocalMusicLoader } from "@/components/player/local-music-loader";
import { LyricsView } from "@/components/player/lyrics-view";
import { VinylVisualizer } from "@/components/player/vinyl-visualizer";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const queue = usePlayerStore((s) => s.queue);
  const setQueue = usePlayerStore((s) => s.setQueue);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const addLocalPlaylist = usePlayerStore((s) => s.addLocalPlaylist);
  const initYtPlaylists = usePlayerStore((s) => s.initYtPlaylists);
  const likedSongs = usePlayerStore((s) => s.likedSongs);
  const toggleLikedSong = usePlayerStore((s) => s.toggleLikedSong);
  const [activeTab, setActiveTab] = useState("Up Next");
  const [ytUrl, setYtUrl] = useState("");
  const [isLoadingYT, setIsLoadingYT] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const router = useRouter();

  const backgroundYtRef = useRef<any>(null);

  console.log("queue : ", queue);

  // Sync the decorative YouTube video with the actual audio player
  useEffect(() => {
    if (
      !backgroundYtRef.current ||
      !currentTrack ||
      currentTrack.source !== "youtube"
    )
      return;

    // We poll the store's current progress because the store drives the true time
    const interval = setInterval(() => {
      const state = usePlayerStore.getState();
      const player = backgroundYtRef.current;
      if (!player || !state.isPlaying) return;

      try {
        const currentSeconds = (state.progress / 100) * state.duration;
        const visualSeconds = player.getCurrentTime() || 0;

        // If the visual background video drifted more than 1.5 seconds out of sync with audio, force it to seek
        if (Math.abs(currentSeconds - visualSeconds) > 1.5) {
          player.seekTo(currentSeconds, true);
        }
      } catch (error) {
        // Player might be unmounted
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTrack]);

  // console.log("queue : " , queue)

  const handleImportYT = async () => {
    if (!ytUrl) {
      toast.error("Please enter a YouTube playlist URL");
      return;
    }

    setIsLoadingYT(true);
    try {
      const res = await fetch(
        `/api/youtube/playlist?url=${encodeURIComponent(ytUrl)}`,
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to import");

      // Add to local playlists and set queue
      addLocalPlaylist({
        id: data.id,
        name: data.name,
        tracks: data.tracks,
        coverUrl: data.coverUrl,
      });

      setQueue(data.tracks, 0);
      toast.success(
        `Imported playlist: ${data.name} (${data.tracks.length} tracks)`,
      );
      setYtUrl(""); // Reset
      setActiveTab("Up Next"); // Switch view
    } catch (err: any) {
      toast.error(err.message || "Something went wrong importing the playlist");
    } finally {
      setIsLoadingYT(false);
    }
  };

  // Auto-scroll to active track in queue
  useEffect(() => {
    if (activeTab === "Up Next" && currentTrack) {
      const activeIndex = queue.findIndex((t) => t.id === currentTrack.id);
      if (activeIndex !== -1) {
        const el = document.getElementById(
          `track-${currentTrack.id}-${activeIndex}`,
        );
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [currentTrack, activeTab, queue]);

  // Load YT playlists on mount
  useEffect(() => {
    initYtPlaylists();
  }, [initYtPlaylists]);

  return (
    <main className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4 overflow-y-auto md:overflow-hidden bg-black text-white h-full relative">
      {/* Left Panel: Now Playing Focus */}
      <div className="w-full md:flex-[0.55] flex flex-col gap-4 md:h-full min-h-[50vh] md:min-h-0 shrink-0">
        {isMinimized && (
          <motion.div
            key="visualizer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="flex-1 min-h-[30vh] md:min-h-0"
          >
            <VinylVisualizer
              isPlaying={isPlaying}
              coverUrl={currentTrack?.coverUrl}
            />
          </motion.div>
        )}
        <div
          className={`bg-[#121212] rounded-[1.5rem] p-4 flex flex-col overflow-hidden transition-all duration-500 w-full ${isMinimized ? "shrink-0" : "flex-1"}`}
        >
          {/* Top Controls */}
          <div className="flex items-center justify-between z-10 shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="flex items-center gap-2 px-2 py-1 bg-white/10 hover:bg-white/20 transition-colors rounded-full text-xs font-medium"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${isMinimized ? "rotate-180" : ""}`}
                />
                {isMinimized ? "Expand" : "Minimize"}
              </button>
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
                className="flex items-center gap-2 md:px-4 md:py-2 px-2 py-2  bg-white/10 hover:bg-white/20 transition-colors rounded-full text-xs font-medium"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="md:block hidden">Full Screen</span>
              </button>
            </div>
            {/* Injecting Local Music Loader here as a temporary hidden-feature or accessible via button */}
            <div className="scale-90 origin-right transition-opacity">
              <LocalMusicLoader />
            </div>
          </div>

          {/* Dynamic Content Area (Artwork/Video or Visualizer) */}
          <div className="mt-4 w-full relative rounded-2xl overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-neutral-900 border border-white/5 flex items-center justify-center transition-all duration-500 flex-1">
            <AnimatePresence mode="wait">
              {isMinimized ? (
                <></>
              ) : currentTrack ? (
                currentTrack.source === "youtube" && showVideo ? (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 w-full h-full bg-black z-0 pointer-events-none"
                  >
                    <YouTube
                      videoId={currentTrack.url}
                      opts={{
                        width: "100%",
                        height: "100%",
                        playerVars: {
                          autoplay: 1,
                          controls: 0,
                          disablekb: 1,
                          fs: 0,
                          modestbranding: 1,
                          playsinline: 1,
                        },
                      }}
                      onReady={(e) => {
                        backgroundYtRef.current = e.target;
                        e.target.mute(); // Ensure it never plays audio
                      }}
                      className="w-full h-full scale-[1.3] opacity-80 pointer-events-none"
                      iframeClassName="w-full h-full"
                    />
                  </motion.div>
                ) : currentTrack.coverUrl ? (
                  <motion.div
                    key="cover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full z-0"
                  >
                    <Image
                      src={currentTrack.coverUrl}
                      alt={currentTrack.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="music-icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="z-0"
                  >
                    <ListMusic className="w-16 h-16 text-neutral-800" />
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="z-0 flex flex-col items-center"
                >
                  <ListMusic className="w-20 h-20 text-neutral-800 mb-2" />
                  <p className="text-neutral-600 font-medium text-sm">
                    No Track Playing
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gradient overlay for text */}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-1" />

            {/* Text Info */}
            <div
              className={`absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row justify-between z-10 gap-4 ${isMinimized ? "items-center bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/5" : "items-start sm:items-end"}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTrack?.id || "empty"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col w-full sm:w-auto overflow-hidden pr-2"
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 leading-tight truncate">
                    {currentTrack?.title || "Vide Music"}
                  </h1>
                  <p className="text-sm sm:text-base text-neutral-300 font-medium truncate">
                    {currentTrack?.artist || "Select a track to start"}
                  </p>
                </motion.div>
              </AnimatePresence>

              {currentTrack && (
                <div className="flex items-end gap-3 sm:gap-4 text-white min-h-[40px] shrink-0">
                  {/* Minimal CSS Visualizer */}
                  {isPlaying && (
                    <div className="flex items-end gap-[2px] h-5 mb-1">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-purple-500 rounded-full"
                          animate={{
                            height: ["20%", "100%", "40%", "80%", "20%"],
                          }}
                          transition={{
                            duration: 1.2 + i * 0.1,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex md:flex-col items-end gap-1 text-white">
                    {currentTrack.source === "youtube" && (
                      <button
                        onClick={() => setShowVideo(!showVideo)}
                        className="px-3 py-1 mb-1 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-white/5 hidden md:block"
                      >
                        {showVideo ? "Hide Video" : "Show Video"}
                      </button>
                    )}
                    {currentTrack.source === "youtube" && (
                      <button
                        onClick={() => {
                          toggleLikedSong(currentTrack);
                          const isLiked = likedSongs.some(
                            (t) => t.id === currentTrack.id,
                          );
                          toast(
                            isLiked
                              ? "Removed from Liked Songs"
                              : "Saved to Liked Songs",
                          );
                        }}
                        className="flex items-center gap-1.5 hover:bg-white/10 p-1.5 -mr-1.5 rounded-lg transition-colors text-sm"
                      >
                        <Heart
                          className={`w-4 h-4 ${likedSongs.some((t) => t.id === currentTrack.id) ? "fill-red-500 text-red-500" : "fill-transparent text-white"}`}
                        />
                        <span className="font-semibold capitalize">
                          {currentTrack.source}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Right Panel: Context & Queue */}
      <div className="bg-[#121212] rounded-[1.5rem] p-4 flex flex-col overflow-hidden transition-all duration-500 w-full md:flex-[0.45] md:h-full min-h-[50vh] md:min-h-0 shrink-0">
        {/* Search Header */}
        <div className="hidden md:flex items-center gap-4 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Search by artists, songs or albums"
              className="w-full bg-[#1a1a1a] border-none rounded-full h-10 pl-12 text-xs text-white placeholder:text-neutral-500 focus-visible:ring-1 placeholder:text-xs focus-visible:ring-neutral-700"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  router.push(
                    `/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`,
                  );
                }
              }}
            />
          </div>
          <button className="size-10 rounded-full bg-linear-to-tr from-purple-600 to-blue-500 shrink-0 border-2 border-[#121212] outline-white/10 transition-transform hover:scale-105 shadow-lg shadow-purple-500/20 text-white font-bold text-sm flex items-center justify-center cursor-pointer">
            ME
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-white/10 mb-6 shrink-0">
          {["Up Next", "Lyrics", "YouTube", "Credits"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs cursor-pointer font-medium relative transition-colors ${
                activeTab === tab
                  ? "text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-white rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 -mx-4 px-4 pr-6 overflow-y-auto no-scrollbar pb-0">
          {activeTab === "Up Next" && (
            <div className="flex flex-col gap-2">
              {queue.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-20 text-center text-neutral-500"
                >
                  <p>Your queue is empty.</p>
                  <p className="text-sm mt-2">
                    Import a folder to see tracks here.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {queue.map((track, i) => {
                    const isPlaying = currentTrack?.id === track.id;
                    return (
                      <motion.div
                        id={`track-${track.id}-${i}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                        key={`${track.id}-${i}`}
                        onClick={() => setQueue(queue, i)}
                        className={`flex items-center gap-4 p-2 rounded-xl group cursor-pointer transition-all duration-200 ${
                          isPlaying
                            ? "bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <span className="w-6 text-center text-sm font-medium text-neutral-500 group-hover:text-white">
                          {isPlaying ? (
                            <Play className="w-4 h-4 mx-auto fill-white pb-[2px]" />
                          ) : (
                            i + 1
                          )}
                        </span>

                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-800">
                          {track.coverUrl ? (
                            <Image
                              src={track.coverUrl}
                              alt={track.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <ListMusic className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-600" />
                          )}
                        </div>

                        <div className="flex flex-col flex-1 min-w-10">
                          <span
                            className={`font-semibold text-sm truncate ${isPlaying ? "text-red-500" : "text-neutral-200"}`}
                          >
                            {track.title}
                          </span>
                          <span className="text-xs text-neutral-500 truncate mt-0.5">
                            {track.artist}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {track.source === "youtube" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLikedSong(track);
                                const isLiked = likedSongs.some(
                                  (t) => t.id === track.id,
                                );
                                toast(
                                  isLiked
                                    ? "Removed from Liked Songs"
                                    : "Added to Liked Songs",
                                );
                              }}
                              className="p-2 text-neutral-400 hover:text-white transition-colors"
                            >
                              <Heart
                                className={`cursor-pointer w-5 h-5 ${likedSongs.some((t) => t.id === track.id) ? "fill-red-500 text-red-500" : "fill-transparent"}`}
                              />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          )}
          {activeTab === "Lyrics" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-4"
            >
              <LyricsView />
            </motion.div>
          )}
          {activeTab === "YouTube" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 flex flex-col items-center justify-center gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                <Play className="w-8 h-8 ml-1" fill="currentColor" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Import YouTube Playlist
              </h3>
              <p className="text-neutral-400 text-sm md:text-base text-center max-w-sm mb-4">
                Paste a YouTube playlist link below to instantly import and
                stream its contents directly through the player.
              </p>
              <div className="flex w-full max-w-sm items-center gap-2">
                <Input
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  placeholder="https://youtube.com/playlist?list=..."
                  className="bg-[#1a1a1a] border-none text-white h-10 focus-visible:ring-1 focus-visible:ring-red-500 text-xs placeholder:text-xs"
                  onKeyDown={(e) => e.key === "Enter" && handleImportYT()}
                  disabled={isLoadingYT}
                />
                <Button
                  onClick={handleImportYT}
                  variant={"destructive"}
                  size={"icon-lg"}
                  disabled={isLoadingYT}
                  className="text-xs md:text-base cursor-pointer"
                >
                  {isLoadingYT ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Import />
                  )}
                </Button>
              </div>
            </motion.div>
          )}
          {activeTab === "Credits" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center text-neutral-500"
            >
              <p>Coming soon.</p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
