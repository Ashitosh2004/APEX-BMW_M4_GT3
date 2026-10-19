"use client";

import { useEffect, useState } from "react";
import {
  useScroll,
  useVelocity,
  useMotionValueEvent,
} from "framer-motion";
import { scrollState, clamp01 } from "@/lib/scroll-state";
import MobileGate, { useIsMobile } from "@/components/racing/mobile-gate";
import Preloader from "@/components/racing/preloader";
import CarScene from "@/components/racing/car-scene";
import Hud from "@/components/racing/hud";
import Cursor from "@/components/racing/cursor";
import Hero from "@/components/racing/sections/hero";
import Power from "@/components/racing/sections/power";
import Aero from "@/components/racing/sections/aero";
import Telemetry from "@/components/racing/sections/telemetry";
import Legacy from "@/components/racing/sections/legacy";

export default function Home() {
  const [ready, setReady] = useState(false);
  const isMobile = useIsMobile();

  const { scrollY, scrollYProgress } = useScroll();
  const velocity = useVelocity(scrollY); // px per second

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollState.progress = clamp01(v);
  });
  useMotionValueEvent(velocity, "change", (v) => {
    // convert px/s → px/frame-ish (@60fps) and low-pass it
    const perFrame = (v || 0) / 60;
    scrollState.velocity = scrollState.velocity * 0.7 + perFrame * 0.3;
  });

  /* normalized mouse for camera parallax */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      scrollState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      scrollState.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* lock scroll while preloading */
  useEffect(() => {
    document.documentElement.style.overflow = ready ? "" : "hidden";
    if (ready) scrollState.ready = true;
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [ready]);

  return (
    <main className="relative">
      <MobileGate />

      {isMobile === false && (
        <>
          {/* 3D layer — paused (demand mode) until the preloader lifts */}
          <CarScene ready={ready} />

          {/* chrome */}
          <Hud ready={ready} />
          <Cursor />

          {/* content layer */}
          <div className="relative z-10">
            <Hero ready={ready} />
            <Power />
            <Aero />
            <Telemetry />
            <Legacy />
          </div>

          {/* preloader on top */}
          {!ready && <Preloader onDone={() => setReady(true)} />}
        </>
      )}
    </main>
  );
}
