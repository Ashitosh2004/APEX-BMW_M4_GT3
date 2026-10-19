"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@react-three/drei";

const BOOT_LINES = [
  "INITIALIZING TELEMETRY BUS",
  "LOADING GEOMETRY // 2264 MESHES",
  "COMPILING SHADER PIPELINE",
  "WARMING TWIN TURBOS",
  "FUEL MAP INJECTED",
  "GRID POSITION CONFIRMED",
];

export default function Preloader({ onDone }: { onDone: () => void }) {
  const { progress } = useProgress();
  const [display, setDisplay] = useState(0);
  const [line, setLine] = useState(0);
  const [phase, setPhase] = useState<"loading" | "exit">("loading");
  const doneRef = useRef(false);
  const startRef = useRef(Date.now());

  /* fake-smooth the raw progress toward 100 with a minimum showtime */
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const elapsed = Date.now() - startRef.current;
      // escape hatch: never hold users hostage if an asset stalls
      const minTime = elapsed > 2600 || elapsed > 15000;
      const target = minTime ? 100 : Math.min(progress, 92 + elapsed / 600);
      setDisplay((d) => {
        // integer state machine — can never stall on a rounding boundary,
        // and re-renders at most once per percent
        if (target >= 100) {
          // hard snap: fast whole-number climb to 92, then snap (slow-rAF safe)
          if (d >= 92) return 100;
          const step = Math.max(2, (92 - d) * 0.25);
          return Math.min(92, Math.floor(d + step));
        }
        const step = Math.max((target - d) * 0.08, 0.34);
        const next = Math.min(d + step, target);
        return Math.floor(next) > d ? Math.floor(next) : d;
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  /* cycle boot lines */
  useEffect(() => {
    const id = setInterval(
      () => setLine((l) => (l + 1) % BOOT_LINES.length),
      640
    );
    return () => clearInterval(id);
  }, []);

  /* one-shot state machine — each step owns its own timeout so cleanups
     can never cancel a step that hasn't fired yet */
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (display < 100 || phase !== "loading" || doneRef.current) return;
    const t = setTimeout(() => setPhase("exit"), 900);
    return () => clearTimeout(t);
  }, [display, phase]);

  useEffect(() => {
    if (phase !== "exit" || doneRef.current) return;
    const t = setTimeout(() => {
      doneRef.current = true;
      onDoneRef.current();
    }, 800);
    return () => clearTimeout(t);
  }, [phase]);

  const pct = Math.round(display);

  return (
    <AnimatePresence>
      <motion.div
          className="fixed inset-0 z-[200] bg-carbon overflow-hidden"
          initial={false}
          animate={
            phase === "exit"
              ? { clipPath: "inset(0 0 100% 0)" }
              : { clipPath: "inset(0 0 0% 0)" }
          }
          transition={{ duration: 0.85, ease: [0.83, 0, 0.17, 1] }}
          aria-hidden={phase === "exit"}
        >
          {/* red sweep bar on exit */}
          {phase === "exit" && (
            <motion.div
              className="absolute inset-x-0 h-[3px] bg-race-red"
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{ duration: 0.8, ease: [0.83, 0, 0.17, 1] }}
            />
          )}

          {/* hazard strip top */}
          <div className="hazard absolute top-0 inset-x-0 h-1.5 opacity-70" />
          <div className="hazard absolute bottom-0 inset-x-0 h-1.5 opacity-70" />

          <div className="h-full flex flex-col justify-between p-10">
            {/* top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-sm font-black tracking-[0.3em]">
                  APEX<span className="text-race-red">{"//"}</span>
                </span>
                <span className="hud-label">GT3 LAUNCH CONTROL</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-race-red animate-blink" />
                <span className="hud-label !text-race-red">SYSTEM ARMING</span>
              </div>
            </div>

            {/* center */}
            <div className="flex flex-col items-center gap-6">
              <motion.div
                className="relative"
                animate={
                  display >= 100
                    ? { scale: 1.06, opacity: [1, 0.9, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.3 }}
              >
                <span className="font-display text-[clamp(96px,18vw,220px)] font-black leading-none tabular-nums text-outline">
                  {String(pct).padStart(3, "0")}
                </span>
                <span className="absolute -right-10 bottom-6 font-display text-3xl font-bold text-race-red">
                  %
                </span>
              </motion.div>
              <div className="relative w-72 h-px bg-white/12">
                <div
                  className="absolute left-0 top-0 h-full bg-race-red transition-[width] duration-150"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="h-5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={display >= 100 ? 99 : line}
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -18, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="hud-label block !text-white/70"
                  >
                    {display >= 100 ? "LIGHTS OUT — GO TO FULL SCREEN MODE" : BOOT_LINES[line]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* bottom row */}
            <div className="flex items-end justify-between">
              <span className="hud-label">{"BMW M4 GT3 // 2022 SEASON"}</span>
              <span className="hud-label">
                590 HP — 4.0L TT-I6 — GT3 CLASS
              </span>
            </div>
          </div>
        </motion.div>
    </AnimatePresence>
  );
}
