"use client";

import { Compass, TrendingUp, Radio } from "lucide-react";

export default function BrowsePage() {
  return (
    <div className="flex-1 flex flex-col p-8 bg-black text-white m-4 rounded-[2rem] min-w-[350px]">
      <div className="flex items-center gap-3 mb-8">
        <Compass className="w-8 h-8 text-purple-500" />
        <h1 className="text-4xl font-bold">Discover</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-linear-to-br from-indigo-500/20 to-purple-500/20 border border-purple-500/30 rounded-2xl p-6 hover:bg-white/5 transition-colors cursor-pointer group">
          <TrendingUp className="w-8 h-8 mb-4 text-purple-400 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold mb-2">Top Charts</h2>
          <p className="text-neutral-400">
            The most played tracks right now globally.
          </p>
        </div>
        <div className="bg-linear-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6 hover:bg-white/5 transition-colors cursor-pointer group">
          <Radio className="w-8 h-8 mb-4 text-blue-400 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold mb-2">Live Radio</h2>
          <p className="text-neutral-400">
            Tune in to curated streams and genres.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Featured Playlists</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Today's Hits", color: "from-green-500 to-emerald-700" },
          { title: "Chill Vibes", color: "from-blue-500 to-indigo-700" },
          { title: "Workout", color: "from-orange-500 to-red-700" },
          { title: "Focus", color: "from-purple-500 to-pink-700" },
        ].map((playlist) => (
          <div
            key={playlist.title}
            className={`aspect-square rounded-xl bg-linear-to-br ${playlist.color} p-4 flex flex-col justify-end relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all`}
          >
            <h3 className="font-bold text-xl text-white shadow-black drop-shadow-md relative z-10">
              {playlist.title}
            </h3>
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
