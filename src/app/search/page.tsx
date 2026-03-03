"use client";

import { usePlayerStore, Track, LocalPlaylist } from "@/store/usePlayerStore";
import { Search as SearchIcon, Play, ListMusic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SearchPage() {
  const { playlists, ytPlaylists, setQueue, initYtPlaylists } =
    usePlayerStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    initYtPlaylists();
  }, [initYtPlaylists]);

  const allPlaylists = useMemo(() => {
    return [...playlists, ...ytPlaylists];
  }, [playlists, ytPlaylists]);

  const allTracks = useMemo(() => {
    const tracksMap = new Map<string, Track>();
    allPlaylists.forEach((playlist) => {
      playlist.tracks.forEach((track) => {
        if (!tracksMap.has(track.id)) {
          tracksMap.set(track.id, track);
        }
      });
    });
    return Array.from(tracksMap.values());
  }, [allPlaylists]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { playlists: [], tracks: [] };
    }

    const query = searchQuery.toLowerCase();

    const matchedPlaylists = allPlaylists.filter((playlist) =>
      playlist.name.toLowerCase().includes(query),
    );

    const matchedTracks = allTracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query),
    );

    return {
      playlists: matchedPlaylists,
      tracks: matchedTracks,
    };
  }, [searchQuery, allPlaylists, allTracks]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden bg-black text-white m-4 rounded-[2rem] min-w-[350px]">
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col overflow-hidden">
        <div className="relative w-full mb-8 shrink-0 mt-4">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for songs or playlists..."
            className="w-full bg-[#1a1a1a] border-none rounded-full h-16 pl-16 text-lg text-white placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-white/20"
          />
        </div>

        <ScrollArea className="flex-1 -mx-4 px-4 h-full">
          {!isSearching ? (
            <div className="pb-24">
              <h2 className="text-2xl font-bold mb-6">Browse all</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  "Podcasts",
                  "Live Events",
                  "Made For You",
                  "New Releases",
                  "Pop",
                  "Hip-Hop",
                  "Rock",
                  "Latin",
                ].map((genre, i) => (
                  <div
                    key={genre}
                    className="aspect-square rounded-xl p-4 font-bold text-xl relative overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: `hsl(${i * 45}, 70%, 40%)`,
                    }}
                  >
                    {genre}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 pb-24">
              {searchResults.tracks.length === 0 &&
              searchResults.playlists.length === 0 ? (
                <div className="text-center text-neutral-500 mt-12">
                  <h3 className="text-xl font-bold text-white mb-2">
                    No results found
                  </h3>
                  <p>
                    Please make sure your words are spelled correctly or use
                    less or different keywords.
                  </p>
                </div>
              ) : (
                <>
                  {/* Matching Tracks */}
                  {searchResults.tracks.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Songs</h2>
                      <div className="flex flex-col gap-2">
                        {searchResults.tracks.map((track, i) => (
                          <div
                            key={track.id + i}
                            onClick={() => setQueue(searchResults.tracks, i)}
                            className="flex items-center gap-4 p-2 rounded-lg hover:bg-neutral-800/50 cursor-pointer group"
                          >
                            <div className="relative w-12 h-12 rounded bg-neutral-800 shrink-0 overflow-hidden">
                              {track.coverUrl ? (
                                <Image
                                  src={track.coverUrl}
                                  alt={track.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ListMusic className="w-5 h-5 text-neutral-500" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play
                                  className="w-5 h-5 text-white ml-1"
                                  fill="currentColor"
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">
                                {track.title}
                              </p>
                              <p className="text-sm text-neutral-400 truncate">
                                {track.artist}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Playlists */}
                  {searchResults.playlists.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4 mt-6">
                        Playlists
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {searchResults.playlists.map((playlist) => (
                          <div
                            key={playlist.id}
                            onClick={() => setQueue(playlist.tracks, 0)}
                            className="group relative rounded-xl overflow-hidden bg-[#121212] hover:bg-[#1a1a1a] p-4 transition-colors cursor-pointer border border-white/5"
                          >
                            <div className="aspect-square rounded-lg bg-neutral-800 mb-4 relative overflow-hidden group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-shadow">
                              {playlist.coverUrl ? (
                                <Image
                                  src={playlist.coverUrl}
                                  alt={playlist.name}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full bg-neutral-800">
                                  <ListMusic className="w-12 h-12 text-neutral-600" />
                                </div>
                              )}
                              <div className="absolute bottom-3 right-3 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all bg-white text-black rounded-full p-4 shadow-xl hover:scale-105">
                                <Play
                                  className="w-6 h-6 ml-1"
                                  fill="currentColor"
                                />
                              </div>
                            </div>
                            <h3 className="font-bold text-base truncate mb-1">
                              {playlist.name}
                            </h3>
                            <p className="text-sm text-neutral-400 truncate">
                              {playlist.tracks.length} tracks
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
