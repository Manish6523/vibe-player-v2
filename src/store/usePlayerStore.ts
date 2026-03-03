import { create } from "zustand";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  coverUrl?: string;
  url: string; // The local blob URL or remote URL to play
  source: "local" | "spotify" | "youtube";
}

export interface LocalPlaylist {
  id: string;
  name: string;
  tracks: Track[];
  coverUrl?: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  playlists: LocalPlaylist[];
  ytPlaylists: LocalPlaylist[];
  likedSongs: Track[];

  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  progress: number; // 0 to 100
  duration: number; // in seconds
  isShuffle: boolean;
  repeatMode: "off" | "all" | "one";

  // Actions
  play: (track?: Track) => void;
  pause: () => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  addToQueue: (track: Track) => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addLocalPlaylist: (playlist: LocalPlaylist) => void;
  removeLocalPlaylist: (id: string, isYt?: boolean) => void;
  toggleLikedSong: (track: Track) => void;
  initYtPlaylists: () => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  ytPlayerRef: any | null;
  setYtPlayerRef: (ref: any) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  playlists: [],
  ytPlaylists: [],
  likedSongs: [],
  isPlaying: false,
  volume: 80,
  isMuted: false,
  progress: 0,
  duration: 0,
  isShuffle: false,
  repeatMode: "off",
  ytPlayerRef: null,

  setYtPlayerRef: (ref) => set({ ytPlayerRef: ref }),

  play: (track) => {
    if (track) {
      set({ currentTrack: track, isPlaying: true });
    } else {
      set({ isPlaying: true });
    }
  },

  pause: () => set({ isPlaying: false }),

  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),

  playNext: () => {
    const { queue, queueIndex, isShuffle, repeatMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === "one") {
      set({ progress: 0, isPlaying: true });
      return;
    }

    let nextIndex = queueIndex + 1;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        set({ isPlaying: false, progress: 0 });
        return;
      }
    }

    set({
      queueIndex: nextIndex,
      currentTrack: queue[nextIndex],
      isPlaying: true,
      progress: 0,
    });
  },

  playPrevious: () => {
    const { queue, queueIndex, progress, duration } = get();
    if (queue.length === 0) return;

    const currentSeconds = (progress / 100) * duration;
    if (currentSeconds > 3) {
      set({ progress: 0 });
      return;
    }

    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      set({
        queueIndex: prevIndex,
        currentTrack: queue[prevIndex],
        isPlaying: true,
        progress: 0,
      });
    } else {
      set({ progress: 0 });
    }
  },

  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),

  toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted,
      volume: state.isMuted ? (state.volume === 0 ? 80 : state.volume) : 0,
    })),

  setProgress: (progress) => set({ progress }),

  setDuration: (duration) => set({ duration }),

  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),

  setQueue: (tracks: Track[], startIndex = 0) =>
    set({
      queue: tracks,
      queueIndex: startIndex,
      currentTrack: tracks[startIndex] || null,
      isPlaying: true,
      progress: 0,
    }),

  initYtPlaylists: async () => {
    try {
      const res = await fetch("/api/ytliked");
      if (res.ok) {
        const data = await res.json();

        // Extract the special "likesong" playlist to populate likedSongs
        const likedPlaylist = data.find((p: any) => p.id === "yt-liked-songs");
        const otherPlaylists = data.filter(
          (p: any) => p.id !== "yt-liked-songs",
        );

        set({
          ytPlaylists: otherPlaylists,
          likedSongs: likedPlaylist ? likedPlaylist.tracks : [],
        });
      }
    } catch (e) {
      console.error("Failed to fetch YT liked playlists", e);
    }
  },

  addLocalPlaylist: async (playlist: LocalPlaylist) => {
    // If it's a youtube playlist, save it to our JSON db
    if (playlist.id.startsWith("yt-playlist-")) {
      const state = get();
      if (state.ytPlaylists.find((p) => p.id === playlist.id)) {
        return; // Prevent duplicate API call
      }
      set((state) => ({ ytPlaylists: [...state.ytPlaylists, playlist] }));
      try {
        await fetch("/api/ytliked", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(playlist),
        });
      } catch (e) {
        console.error("Failed to save YT liked playlist", e);
      }
    } else {
      const state = get();
      if (state.playlists.find((p) => p.id === playlist.id)) {
        return;
      }
      set((state) => ({ playlists: [...state.playlists, playlist] }));
    }
  },

  removeLocalPlaylist: async (id, isYt) => {
    if (isYt) {
      set((state) => ({
        ytPlaylists: state.ytPlaylists.filter((p) => p.id !== id),
      }));
      try {
        await fetch(`/api/ytliked?id=${id}`, {
          method: "DELETE",
        });
      } catch (e) {
        console.error("Failed to delete YT liked playlist", e);
      }
    } else {
      set((state) => ({
        playlists: state.playlists.filter((p) => p.id !== id),
      }));
    }
  },

  toggleLikedSong: (track) => {
    set((state) => {
      const exists = state.likedSongs.some((t) => t.id === track.id);
      const newLiked = exists
        ? state.likedSongs.filter((t) => t.id !== track.id)
        : [...state.likedSongs, track];

      // Async save to backend
      fetch("/api/ytliked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "yt-liked-songs",
          name: "likesong",
          tracks: newLiked,
          coverUrl: newLiked.length > 0 ? newLiked[0].coverUrl : "",
        }),
      }).catch((err) =>
        console.error("Failed to save liked songs to backend", err),
      );

      return { likedSongs: newLiked };
    });
  },

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

  toggleRepeat: () => {
    set((state) => {
      const order: ("off" | "all" | "one")[] = ["off", "all", "one"];
      const currentIndex = order.indexOf(state.repeatMode);
      return { repeatMode: order[(currentIndex + 1) % order.length] };
    });
  },
}));
