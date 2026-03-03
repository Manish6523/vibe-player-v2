import { motion } from "framer-motion";
import Image from "next/image";
import { Music } from "lucide-react";

export function VinylVisualizer({
  isPlaying,
  coverUrl,
}: {
  isPlaying: boolean;
  coverUrl?: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full py-8">
      {/* Subtle background glow */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none overflow- rounded-2xl">
        <motion.div
          animate={
            isPlaying
              ? { opacity: 0.1, scale: [1, 1.05, 1] }
              : { opacity: 0.05, scale: 1 }
          }
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-[300px] h-[300px] bg-white rounded-full blur-[80px]"
        />
      </div>

      <div className="z-10 relative flex items-center justify-center w-full aspect-square max-w-[400px]">
        {/* The Vinyl Record */}
        <motion.div
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="relative w-full h-full max-w-[320px] max-h-[320px] rounded-full bg-[#111] border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden"
          style={{
            background: "radial-gradient(circle, #222 0%, #0a0a0a 100%)",
          }}
        >
          {/* Vinyl Grooves (subtle rings) */}
          <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute inset-10 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute inset-16 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute inset-24 rounded-full border border-white/5 pointer-events-none" />

          {/* Center Label (Album Art) */}
          <div className="relative w-[140px] h-[140px] rounded-full border-2 border-[#0a0a0a] shadow-[0_0_10px_rgba(0,0,0,0.5)] overflow-hidden bg-neutral-900 flex items-center justify-center z-20">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt="Track Artwork"
                fill
                className="object-cover"
              />
            ) : (
              <Music className="w-8 h-8 text-neutral-600" />
            )}

            {/* The Spindle Hole */}
            <div className="absolute w-3 h-3 bg-[#0a0a0a] rounded-full border border-white/10 z-30 shadow-inner" />
          </div>

          {/* Subtle lighting reflection across the vinyl */}
          <div className="absolute inset-0 rounded-full bg-linear-to-tr from-white/0 via-white/10 to-transparent mix-blend-overlay pointer-events-none z-30" />
        </motion.div>
      </div>
    </div>
  );
}
