"use client";

import { useState, useRef } from "react";
import { FolderUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayerStore, Track } from "@/store/usePlayerStore";
import * as musicMetadata from "music-metadata";

export function LocalMusicLoader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setQueue = usePlayerStore((state) => state.setQueue);

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const audioFiles = Array.from(files).filter(
      (file) =>
        file.type.startsWith("audio/") ||
        file.name.endsWith(".mp3") ||
        file.name.endsWith(".wav") ||
        file.name.endsWith(".flac") ||
        file.name.endsWith(".m4a"),
    );

    const tracksByFolder: Record<string, Track[]> = {};

    for (const file of audioFiles) {
      // webkitRelativePath looks like "TopFolder/Subfolder/song.mp3"
      // we want to group by the top level folder, or the immediate parent folder.
      const pathParts = file.webkitRelativePath.split("/");
      let folderName = "Uploaded Music";

      if (pathParts.length > 1) {
        // If there are subfolders, group by the first subfolder under the root selected folder
        // e.g., if user selects "Music", and it has "P1" and "P2", pathParts[0] is "Music" and pathParts[1] is "P1".
        folderName = pathParts.length > 2 ? pathParts[1] : pathParts[0];
      }

      try {
        const metadata = await musicMetadata.parseBlob(file);

        let coverUrl = "";
        const picture = metadata.common.picture?.[0];
        if (picture) {
          const blob = new Blob([new Uint8Array(picture.data)], {
            type: picture.format,
          });
          coverUrl = URL.createObjectURL(blob);
        }

        const track: Track = {
          id: file.webkitRelativePath || file.name,
          title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ""),
          artist: metadata.common.artist || "Unknown Artist",
          album: metadata.common.album || "Unknown Album",
          duration: metadata.format.duration || 0,
          coverUrl,
          url: URL.createObjectURL(file),
          source: "local",
        };

        if (!tracksByFolder[folderName]) {
          tracksByFolder[folderName] = [];
        }
        tracksByFolder[folderName].push(track);
      } catch (error) {
        console.error("Error parsing metadata for", file.name, error);
      }
    }

    const { addLocalPlaylist } = usePlayerStore.getState();
    const newPlaylists = [];

    for (const [folderName, tracks] of Object.entries(tracksByFolder)) {
      if (tracks.length > 0) {
        const playlist = {
          id: `local_pl_${Date.now()}_${folderName}`,
          name: folderName,
          tracks,
          // Use the cover of the first track as the playlist cover
          coverUrl: tracks.find((t) => t.coverUrl)?.coverUrl,
        };
        addLocalPlaylist(playlist);
        newPlaylists.push(playlist);
      }
    }

    // Optionally auto-play the first imported playlist
    if (newPlaylists.length > 0 && newPlaylists[0].tracks.length > 0) {
      setQueue(newPlaylists[0].tracks, 0);
    }

    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* 
        This uses webkitdirectory to allow folder selection.
        It's standard across modern desktop browsers. 
      */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFolderSelect}
        className="hidden"
        // @ts-expect-error webkitdirectory is a non-standard attribute supported across browsers
        webkitdirectory="true"
        directory=""
        multiple
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="w-full sm:w-auto hover:bg-primary/20 hover:text-primary transition-colors border-primary/50"
      >
        {isProcessing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FolderUp className="mr-2 h-4 w-4" />
        )}
        Import Folder
      </Button>
    </div>
  );
}
