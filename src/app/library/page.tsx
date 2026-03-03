"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import { Heart, ListMusic, Play, Trash2 } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocalMusicLoader } from "@/components/player/local-music-loader";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

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
    <div className="flex-1 flex flex-col p-8 overflow-hidden bg-black text-white rounded-[2rem] m-4 relative min-w-[350px]">
      <div className="flex items-center justify-between mb-8 z-10 shrink-0">
        <div>
          <h1 className="text-4xl font-bold mb-2">Your Library</h1>
          <p className="text-neutral-400">
            All your uploaded playlists and folders
          </p>
        </div>
        <LocalMusicLoader />
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
            <h2 className="text-2xl font-bold mb-6 mt-4">Local Folders</h2>
            {playlists.length === 0 ? (
              <p className="text-neutral-500">No local folders imported yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => {
                      setQueue(playlist.tracks, 0);
                    }}
                    className="group relative rounded-xl overflow-hidden bg-[#121212] hover:bg-[#1a1a1a] p-4 transition-colors cursor-pointer border border-white/5"
                  >
                    <div className="aspect-square rounded-lg bg-neutral-800 mb-4 relative overflow-hidden group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-shadow">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLocalPlaylist(playlist.id, false);
                        }}
                        className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                        <Play className="w-6 h-6 ml-1" fill="currentColor" />
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
            )}

            {availableLikedSongs.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-6 mt-12 text-red-100 flex items-center gap-2">
                  <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                  Liked Songs
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
                  <div
                    onClick={() => {
                      setQueue(availableLikedSongs, 0);
                      router.push(`/`);
                    }}
                    className="group relative rounded-xl overflow-hidden bg-[#1a1111] hover:bg-[#251515] p-4 transition-colors cursor-pointer border border-red-900/30"
                  >
                    <div className="aspect-square rounded-lg bg-red-950/40 mb-4 relative overflow-hidden group-hover:shadow-[0_8px_24px_rgba(239,68,68,0.2)] transition-shadow flex items-center justify-center">
                      <Heart
                        className="w-16 h-16 text-red-500/80 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-transform duration-500 group-hover:scale-110"
                        fill="currentColor"
                      />

                      <div className="absolute bottom-3 right-3 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all bg-red-600 text-white rounded-full p-4 shadow-xl hover:scale-105">
                        <Play className="w-6 h-6 ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <h3 className="font-bold text-base truncate mb-1 text-red-100">
                      Liked Songs
                    </h3>
                    <p className="text-sm text-red-900/80 truncate font-medium">
                      {availableLikedSongs.length} tracks
                    </p>
                  </div>
                </div>
              </>
            )}

            <h2 className="text-2xl font-bold mb-6 mt-12">
              Saved from YouTube
            </h2>
            {ytPlaylists.length === 0 ? (
              <p className="text-neutral-500">
                No YouTube playlists imported yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {ytPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => {
                      setQueue(playlist.tracks, 0);
                      router.push(`/`);
                    }}
                    className="group relative rounded-xl overflow-hidden bg-[#121212] hover:bg-[#1a1a1a] p-4 transition-colors cursor-pointer border border-white/5"
                  >
                    <div className="aspect-square rounded-lg bg-neutral-800 mb-4 relative overflow-hidden group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-shadow">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLocalPlaylist(playlist.id, true);
                        }}
                        className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {playlist.coverUrl ? (
                        <Image
                          src={playlist.coverUrl}
                          alt={playlist.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-neutral-800 text-red-500">
                          <Play
                            className="w-12 h-12 opacity-50"
                            fill="currentColor"
                          />
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all bg-red-600 text-white rounded-full p-4 shadow-xl hover:scale-105 group-hover:bg-red-500">
                        <Play className="w-6 h-6 ml-1" fill="currentColor" />
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
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
