import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function MinimalVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const [bars, setBars] = useState<number[]>(Array(60).fill(4));

  useEffect(() => {
    if (!isPlaying) {
      setBars(Array(60).fill(4));
      return;
    }

    let frame: number;
    let t = 0;

    const update = () => {
      t += 0.15; // Speed of the wave
      setBars((prev) =>
        prev.map((_, i) => {
          // Normalize i to range -1 to 1 around the center
          const normalized = (i - 30) / 30;
          // Create an envelope so center is high, edges are low (bell curve-like)
          const envelope = Math.max(0, 1 - Math.abs(normalized) * 1.2);

          // Combination of sine waves for a complex, evolving pattern
          const wave1 = Math.sin(t + i * 0.2);
          const wave2 = Math.cos(t * 0.8 - i * 0.1);
          const noise = (wave1 + wave2) / 2; // Range roughly -1 to 1

          // Spikes simulate transients/beats
          const randomSpike = Math.random() > 0.9 ? Math.random() * 80 : 0;

          // Base height + wave motion + spikes
          let h = (30 + noise * 50 + randomSpike) * envelope;

          // Clamp values
          if (h < 4) h = 4;
          if (h > 100) h = 100;

          return h;
        }),
      );

      // Throttle slightly to look like a hardware visualizer (e.g. 24fps)
      setTimeout(() => {
        frame = requestAnimationFrame(update);
      }, 1000 / 24);
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  return (
    <div className="flex-1 flex flex-col items-center justify-end relative w-full h-full pb-20">
      {/* Background ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none overflow-hidden rounded-2xl">
        <motion.div
          animate={
            isPlaying
              ? {
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.4, 0.3],
                }
              : { scale: 1, opacity: 0.1 }
          }
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-[400px] h-[400px] bg-purple-900/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={
            isPlaying
              ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }
              : { scale: 1, opacity: 0.05 }
          }
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute w-[600px] h-[300px] bg-blue-900/20 rounded-full blur-[150px] bottom-0"
        />
      </div>

      <div className="z-10 flex items-end justify-center gap-[2px] sm:gap-[3px] w-full px-4 h-[50%] max-h-[300px]">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="w-1.5 sm:w-2 bg-gradient-to-t from-purple-600 to-blue-400 rounded-t-sm shadow-[0_0_10px_rgba(168,85,247,0.3)]"
            animate={{ height: `${h}%` }}
            transition={{ type: "tween", duration: 0.05, ease: "linear" }}
          />
        ))}
      </div>
    </div>
  );
}
