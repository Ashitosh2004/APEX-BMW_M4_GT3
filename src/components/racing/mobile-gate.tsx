"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MonitorX, MousePointer2, Maximize2 } from "lucide-react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const ua = navigator.userAgent || "";
      const isTouchDevice =
        "ontouchstart" in window && matchMedia("(pointer: coarse)").matches;
      const mobileUA =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
          ua
        ) || (/Macintosh/.test(ua) && "ontouchstart" in window); // iPadOS 13+
      const narrow = matchMedia("(max-width: 1023px)").matches;
      setIsMobile(mobileUA || narrow || isTouchDevice);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

export { useIsMobile };

export default function MobileGate() {
  const isMobile = useIsMobile();

  if (isMobile === null) {
    // avoid flash — block everything until detection resolves
    return <div className="fixed inset-0 z-[300] bg-carbon" />;
  }
  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-carbon flex flex-col overflow-hidden">
      <div className="hazard h-2 w-full opacity-80" />

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="brackets border border-white/15 p-8 mb-10 bg-white/[0.02]"
        >
          <MonitorX
            className="w-14 h-14 text-race-red mx-auto"
            strokeWidth={1.25}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="hud-label !text-race-red mb-4"
        >
          GRID ACCESS DENIED
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.55 }}
          className="font-display text-4xl sm:text-5xl font-black tracking-wide mb-6"
        >
          DESKTOP <span className="text-outline-red">ONLY</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.55 }}
          className="max-w-md text-sm leading-relaxed text-white/55 mb-10"
        >
          This is a cinematic WebGL experience with a live 3D BMW M4 GT3,
          real-time reflections and scroll-choreographed camera work. It is
          tuned for large screens — grab a laptop or desktop to hit the track.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-white/40"
        >
          <span className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase">
            <Maximize2 className="w-4 h-4 text-race-red" /> 1280px+ viewport
          </span>
          <span className="hidden sm:block h-4 w-px bg-white/15" />
          <span className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase">
            <MousePointer2 className="w-4 h-4 text-race-red" /> Mouse + keyboard
          </span>
        </motion.div>
      </div>

      <div className="hazard h-2 w-full opacity-80" />
    </div>
  );
}
