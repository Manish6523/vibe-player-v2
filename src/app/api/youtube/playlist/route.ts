import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");

  if (!urlParam) {
    return NextResponse.json(
      { error: "Missing playlist URL" },
      { status: 400 },
    );
  }

  // Extract playlist ID
  let playlistId = "";
  try {
    const parsedUrl = new URL(urlParam);
    playlistId = parsedUrl.searchParams.get("list") || "";
  } catch (e) {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  if (!playlistId) {
    return NextResponse.json(
      {
        error:
          "Could not extract playlist ID from URL. Ensure it contains ?list=...",
      },
      { status: 400 },
    );
  }

  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "YouTube API key is not configured in .env.local" },
      { status: 500 },
    );
  }

  try {
    // 1. Fetch playlist metadata
    const playlistMetaRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${API_KEY}`,
    );
    const playlistMeta = await playlistMetaRes.json();

    if (!playlistMeta.items || playlistMeta.items.length === 0) {
      return NextResponse.json(
        { error: "Playlist not found or is private" },
        { status: 404 },
      );
    }

    const playlistName = playlistMeta.items[0].snippet.title;

    // 2. Fetch playlist items
    let items: any[] = [];
    let nextPageToken = "";

    do {
      const itemsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`,
      );
      const itemsData = await itemsRes.json();

      if (itemsData.items) {
        items = items.concat(itemsData.items);
      }
      nextPageToken = itemsData.nextPageToken;
    } while (nextPageToken && items.length < 200); // Cap at 200

    // 3. Transform to Track format
    const tracks = items
      .map((item: any) => {
        const videoId = item.contentDetails.videoId;
        const snippet = item.snippet;
        return {
          id: `yt-${videoId}`,
          title: snippet.title,
          artist: snippet.videoOwnerChannelTitle || "YouTube",
          duration: 0, // YouTube limits duration fetching without doing 50 videos per API call to Videos endpoint. Will rely on player to set duration metadata when it loads.
          coverUrl:
            snippet.thumbnails?.high?.url ||
            snippet.thumbnails?.medium?.url ||
            snippet.thumbnails?.default?.url,
          url: videoId, // Use videoId for standard react-youtube iframe loading
          source: "youtube",
        };
      })
      .filter(
        (track: any) =>
          track.title !== "Private video" && track.title !== "Deleted video",
      );

    return NextResponse.json({
      id: `yt-playlist-${playlistId}`,
      name: playlistName,
      tracks,
      coverUrl: tracks[0]?.coverUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch playlist" },
      { status: 500 },
    );
  }
}
