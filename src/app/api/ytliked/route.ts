import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const dbPath = path.join(process.cwd(), "ytliked.json");

// Helper to ensure file exists
async function getDb() {
  try {
    const data = await fs.readFile(dbPath, "utf8");
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      const defaultData = { playlists: [] };
      await fs.writeFile(dbPath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    throw error;
  }
}

export async function GET() {
  try {
    const db = await getDb();
    return NextResponse.json(db.playlists);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to read liked playlists" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const playlist = await request.json();

    if (!playlist.id || !playlist.name || !playlist.tracks) {
      return NextResponse.json(
        { error: "Invalid playlist data" },
        { status: 400 },
      );
    }

    const db = await getDb();

    // Check if already exists
    const existsIndex = db.playlists.findIndex(
      (p: any) => p.id === playlist.id,
    );

    if (existsIndex >= 0) {
      // Update existing
      db.playlists[existsIndex] = playlist;
    } else {
      // Add new
      db.playlists.push(playlist);
    }

    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ success: true, playlist });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to save liked playlist" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Playlist ID is required" },
        { status: 400 },
      );
    }

    const db = await getDb();

    const initialLength = db.playlists.length;
    db.playlists = db.playlists.filter((p: any) => p.id !== id);

    if (db.playlists.length === initialLength) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 },
      );
    }

    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete liked playlist" },
      { status: 500 },
    );
  }
}
