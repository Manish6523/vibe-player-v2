"use client";

import { usePlayerStore, Track } from "@/store/usePlayerStore";
import {
  Search as SearchIcon,
  Play,
  ListMusic,
  Music2,
  MoreHorizontal,
  Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const {
    playlists,
    ytPlaylists,
    setQueue,
    initYtPlaylists,
    currentTrack,
    toggleLikedSong,
    likedSongs,
  } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    initYtPlaylists();
  }, [initYtPlaylists]);

  const allPlaylists = useMemo(
    () => [...playlists, ...ytPlaylists],
    [playlists, ytPlaylists],
  );

  const allTracks = useMemo(() => {
    const tracksMap = new Map<string, Track>();
    allPlaylists.forEach((p) =>
      p.tracks.forEach((t) => {
        if (!tracksMap.has(t.id)) tracksMap.set(t.id, t);
      }),
    );
    return Array.from(tracksMap.values());
  }, [allPlaylists]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { playlists: [], tracks: [] };
    const query = searchQuery.toLowerCase();
    return {
      playlists: allPlaylists.filter((p) =>
        p.name.toLowerCase().includes(query),
      ),
      tracks: allTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.artist.toLowerCase().includes(query),
      ),
    };
  }, [searchQuery, allPlaylists, allTracks]);

  return (
    <div className="flex-1 flex flex-col p-2 md:p-6 overflow-y-auto bg-[#050505] text-white h-full">
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col p-2 md:p-6 rounded-[2rem]">
        {/* Search Input */}
        <div className="relative w-full mb-8 shrink-0">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by artists, songs or albums"
            className="w-full bg-[#1a1a1a] text-xs placeholder:text-xs border-none rounded-full h-14 pl-16 text-neutral-200 placeholder:text-neutral-500 focus-visible:ring-1 focus-visible:ring-white/10"
          />
        </div>

        <ScrollArea className="flex-1 -mx-4 px-4 h-full no-scrollbar">
          <div className="space-y-10 pb-20">
            {/* Tracks Section */}
            {searchResults.tracks.length > 0 && (
              <div>
                <h2 className="text-xs font-bold tracking-widest text-neutral-500 uppercase mb-4 ml-2">
                  Tracks Found
                </h2>
                <div className="flex flex-col gap-2">
                  {searchResults.tracks.map((track, i) => {
                    const isPlaying = currentTrack?.id === track.id;
                    const isLiked = likedSongs.some((s) => s.id === track.id);
                    return (
                      <div
                        key={track.id + i}
                        onClick={() => setQueue(searchResults.tracks, i)}
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 group cursor-pointer",
                          isPlaying ? "bg-white/10" : "hover:bg-white/5",
                        )}
                      >
                        {/* <div className="w-8 text-center text-xs font-bold text-neutral-600 group-hover:text-white shrink-0">
                          {isPlaying ? <Play className="w-3 h-3 mx-auto fill-white" /> : i + 1}
                        </div> */}

                        <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-neutral-800">
                          {track.coverUrl ? (
                            <Image
                              src={track.coverUrl}
                              alt={track.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <ListMusic className="w-5 h-5 absolute inset-0 m-auto text-neutral-600" />
                          )}
                        </div>

                        {/* FIX: min-w-0 allows the flex child to shrink below its content size */}
                        <div className="flex-1 min-w-0">
                          <p
                            title={track.title}
                            className={cn(
                              "font-bold text-xs truncate uppercase tracking-tight block",
                              isPlaying ? "text-red-500" : "text-white",
                            )}
                          >
                            <span className="truncate md:hidden">
                              {track.title.length > 25
                                ? track.title.slice(0, 25) + "..."
                                : track.title}
                            </span>
                            <span className="hidden md:block">
                              {track.title}
                            </span>
                          </p>
                          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-tighter mt-0.5 truncate">
                            <span className="truncate md:hidden">
                              {track.artist.slice(0, 25)}
                            </span>
                            <span className="hidden md:block">
                              {track.artist}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity pr-2 shrink-0">
                          <Heart
                            className={cn(
                              "w-4 h-4 cursor-pointer",
                              isLiked
                                ? "fill-red-500 text-red-500"
                                : "text-neutral-500 hover:text-white",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLikedSong(track);
                            }}
                          />
                          <MoreHorizontal className="w-4 h-4 text-neutral-500 hover:text-white" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Playlists Section */}
            {searchResults.playlists.length > 0 && (
              <div>
                <h2 className="text-xs font-bold tracking-widest text-neutral-500 uppercase mb-6 ml-2">
                  Collections
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {searchResults.playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      onClick={() => setQueue(playlist.tracks, 0)}
                      className="group flex flex-col cursor-pointer min-w-0"
                    >
                      <div className="aspect-square w-full rounded-2xl mb-4 relative overflow-hidden bg-neutral-900 border border-white/5 transition-all group-hover:border-white/10 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        {playlist.coverUrl ? (
                          <Image
                            src={playlist.coverUrl}
                            alt={playlist.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <Music2 className="w-10 h-10 absolute inset-0 m-auto text-neutral-800" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Play
                              className="w-5 h-5 ml-1"
                              fill="currentColor"
                            />
                          </div>
                        </div>
                      </div>

                      {/* FIX: Ensure container and text both support truncation */}
                      <div className="px-1 min-w-0">
                        <h3
                          className="font-bold text-sm truncate uppercase block"
                          title={playlist.name}
                        >
                          {playlist.name}
                        </h3>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1 truncate">
                          {playlist.tracks.length} Index
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {searchQuery &&
              searchResults.tracks.length === 0 &&
              searchResults.playlists.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-600">
                  <Music2 className="w-12 h-12 mb-4 opacity-10" />
                  <p className="text-sm font-bold tracking-[0.2em] uppercase">
                    No Archive Match
                  </p>
                </div>
              )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
