"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import YouTube, { YouTubeProps } from "react-youtube";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    playNext,
    setProgress,
    setDuration,
    ytPlayerRef,
    setYtPlayerRef,
  } = usePlayerStore();

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync isPlaying state for local & youtube
  useEffect(() => {
    if (currentTrack?.source === "local" && audioRef.current) {
      if (ytPlayerRef?.pauseVideo) {
        try {
          ytPlayerRef.pauseVideo();
        } catch (e) {}
      }
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((e) => console.log("Audio playback failed", e));
      } else {
        audioRef.current.pause();
      }
    } else if (currentTrack?.source === "youtube" && ytPlayerRef) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (isPlaying) {
        try {
          ytPlayerRef.playVideo();
        } catch (e) {}
      } else {
        try {
          ytPlayerRef.pauseVideo();
        } catch (e) {}
      }
    }
  }, [isPlaying, currentTrack, ytPlayerRef]);

  // Sync volume for local & youtube
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
    if (ytPlayerRef) {
      try {
        if (isMuted) {
          ytPlayerRef.mute?.();
        } else {
          ytPlayerRef.unMute?.();
          ytPlayerRef.setVolume?.(volume);
        }
      } catch (e) {}
    }
  }, [volume, isMuted, currentTrack, ytPlayerRef]);

  // Handle local track change
  useEffect(() => {
    if (audioRef.current && currentTrack && currentTrack.source === "local") {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((e) => console.log("Local audio playback failed", e));
      }
    }
  }, [currentTrack]);

  // Progress polling for YouTube (since it lacks an onTimeUpdate event)
  useEffect(() => {
    if (currentTrack?.source === "youtube") {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      progressIntervalRef.current = setInterval(() => {
        // use get() from store or the ref directly to avoid stale closures if needed
        const playerRef = usePlayerStore.getState().ytPlayerRef;
        const currentIsPlaying = usePlayerStore.getState().isPlaying;

        if (
          playerRef &&
          currentIsPlaying &&
          typeof playerRef.getCurrentTime === "function"
        ) {
          try {
            const currentTime = playerRef.getCurrentTime();
            const duration = playerRef.getDuration();
            if (duration && duration > 0) {
              setProgress((currentTime / duration) * 100);
            }
          } catch (e) {}
        }
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [currentTrack]); // Removed isPlaying and setProgress to prevent constant re-rendering/clearing of intervals

  // Local Audio Handlers
  const handleTimeUpdate = () => {
    if (currentTrack?.source !== "local") return;
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      const currentTime = audioRef.current.currentTime;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    playNext();
  };

  // YouTube Handlers
  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    setYtPlayerRef(event.target);
    const duration = event.target.getDuration();
    if (duration) setDuration(duration);

    // Set initial volume
    if (isMuted) {
      event.target.mute();
    } else {
      event.target.setVolume(volume);
    }

    if (isPlaying) {
      event.target.playVideo();
    }
  };

  const onPlayerStateChange: YouTubeProps["onStateChange"] = (event) => {
    // State 0 is ended
    if (event.data === 0) {
      playNext();
    }
    // State 1 is playing, capture duration inside here as sometimes it's not ready on load
    if (event.data === 1) {
      const duration = event.target.getDuration();
      if (duration) setDuration(duration);
    }
  };

  return (
    <>
      {/* HTML5 Audio for Local files */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />

      {/* Embedded hidden YouTube Player */}
      {currentTrack?.source === "youtube" && currentTrack.url && (
        <div className="fixed -top-[1000px] -left-[1000px] opacity-0 pointer-events-none w-1 h-1">
          <YouTube
            videoId={currentTrack.url}
            opts={{
              height: "1",
              width: "1",
              playerVars: {
                autoplay: isPlaying ? 1 : 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                playsinline: 1,
                origin:
                  typeof window !== "undefined"
                    ? window.location.origin
                    : "http://localhost:3000",
              },
            }}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
          />
        </div>
      )}
    </>
  );
}
