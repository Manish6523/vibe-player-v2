"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import { Disc, Heart, ListMusic, Play, Trash2 } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocalMusicLoader } from "@/components/player/local-music-loader";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LibraryPage() {
  const {
    playlists,
    ytPlaylists,
    likedSongs,
    setQueue,
    initYtPlaylists,
    removeLocalPlaylist,
  } = usePlayerStore();

  useEffect(() => {
    initYtPlaylists();
  }, [initYtPlaylists]);

  const router = useRouter();

  // Filter out 'local' songs that haven't been re-imported in this session
  const availableLikedSongs = useMemo(() => {
    const loadedLocalIds = new Set(
      playlists.flatMap((p) => p.tracks.map((t) => t.id)),
    );
    return likedSongs.filter((track) => {
      if (track.source === "local") {
        return loadedLocalIds.has(track.id);
      }
      return true; // youtube is always available
    });
  }, [likedSongs, playlists]);

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden bg-black text-white rounded-[2rem] m-0 relative min-w-[350px]">
      <div className="flex items-center justify-between mb-8 z-10 shrink-0">
        <div>
          <h1 className="text-4xl font-bold mb-2">Your Library</h1>
          <p className="text-neutral-400">
            All your uploaded playlists and folders
          </p>
        </div>
        {/* <LocalMusicLoader /> */}
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4 h-full">
        {playlists.length === 0 && ytPlaylists.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-neutral-500 border-2 border-dashed border-neutral-800 rounded-2xl bg-neutral-900/50 mt-8">
            <ListMusic className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg">Your library is empty.</p>
            <p className="text-sm mt-1">
              Import a local folder or a YouTube playlist to see them here.
            </p>
          </div>
        ) : (
          <div className="pb-24">
            <h2 className="text-2xl font-bold mb-6 mt-4">Local Music</h2>
            {playlists.length === 0 && availableLikedSongs.length === 0 ? (
              <p className="text-neutral-500">
                No local music or liked songs yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6 mb-12">
                {availableLikedSongs.length > 0 && (
                  <div
                    onClick={() => {
                      setQueue(availableLikedSongs, 0);
                      router.push(`/`);
                    }}
                    className="group relative flex flex-col cursor-pointer"
                  >
                    {/* Visual Container */}
                    <div className="relative aspect-square w-full bg-red-950/20 rounded-2xl overflow-hidden mb-4 border border-red-900/30 transition-all duration-700 group-hover:border-red-500/30 flex items-center justify-center">
                      <Heart
                        className="w-12 h-12 text-red-500/80 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-transform duration-500 group-hover:scale-110"
                        fill="currentColor"
                      />
                      {/* Minimalist Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white">
                          Play
                        </span>
                      </div>
                    </div>
                    {/* Info Layer */}
                    <div className="px-1">
                      <h3 className="font-black text-[14px] uppercase tracking-tighter truncate leading-tight text-red-100 group-hover:text-red-50 transition-colors">
                        Liked Songs
                      </h3>
                      <p className="text-[10px] font-bold text-red-900/80 uppercase tracking-[0.2em] mt-1">
                        {availableLikedSongs.length} Tracks
                      </p>
                    </div>
                  </div>
                )}
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => {
                      setQueue(playlist.tracks, 0);
                      router.push(`/`);
                    }}
                    className="group relative flex flex-col cursor-pointer"
                  >
                    {/* Visual Container */}
                    <div className="relative aspect-square w-full bg-neutral-900 rounded-2xl overflow-hidden mb-4 border border-white/5 transition-all duration-700 group-hover:border-white/20">
                      {/* The Image */}
                      {playlist.coverUrl ? (
                        <Image
                          src={playlist.coverUrl}
                          alt={playlist.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-neutral-900">
                          <Disc className="w-12 h-12 text-neutral-800" />
                        </div>
                      )}

                      {/* Minimalist Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white">
                          Select
                        </span>
                      </div>

                      {/* Minimal Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLocalPlaylist(playlist.id, true);
                        }}
                        className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black z-20 text-white border border-white/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Info Layer */}
                    <div className="px-1">
                      <h3 className="font-black text-[14px] uppercase tracking-tighter truncate leading-tight group-hover:text-neutral-300 transition-colors">
                        {playlist.name}
                      </h3>
                      <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em] mt-1">
                        {playlist.tracks.length} Tracks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 className="text-2xl font-bold mb-6 mt-12">
              Saved from YouTube
            </h2>
            {ytPlaylists.length === 0 ? (
              <p className="text-neutral-500">
                No YouTube playlists imported yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6 pb-8">
                {ytPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => {
                      setQueue(playlist.tracks, 0);
                      router.push(`/`);
                    }}
                    className="group relative flex flex-col cursor-pointer"
                  >
                    {/* Visual Container */}
                    <div className="relative aspect-square w-full bg-neutral-900 rounded-2xl overflow-hidden mb-4 border border-white/5 transition-all duration-700 group-hover:border-white/20">
                      {/* The Image */}
                      {playlist.coverUrl ? (
                        <Image
                          src={playlist.coverUrl}
                          alt={playlist.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-neutral-900">
                          <Disc className="w-12 h-12 text-neutral-800" />
                        </div>
                      )}

                      {/* Minimalist Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white">
                          Select
                        </span>
                      </div>

                      {/* Minimal Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLocalPlaylist(playlist.id, true);
                        }}
                        className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black z-20 text-white border border-white/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Info Layer */}
                    <div className="px-1">
                      <h3 className="font-black text-[14px] uppercase tracking-tighter truncate leading-tight group-hover:text-neutral-300 transition-colors">
                        {playlist.name}
                      </h3>
                      <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em] mt-1">
                        {playlist.tracks.length} Tracks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
