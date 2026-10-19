"use client";

import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let hovering = false;
    let dotDirty = true;
    let ringDirty = true;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const t = e.target as HTMLElement | null;
      const nextHover = !!t?.closest("a, button, [data-hover]");
      if (nextHover !== hovering) ringDirty = true;
      hovering = nextHover;
      dotDirty = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (dotDirty) {
        dotDirty = false;
        dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
      const dx = mx - rx;
      const dy = my - ry;
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05 || ringDirty) {
        ringDirty = false;
        rx += dx * 0.16;
        ry += dy * 0.16;
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${hovering ? 1.9 : 1})`;
        ring.style.borderColor = hovering
          ? "rgba(225, 6, 0, 0.9)"
          : "rgba(244, 244, 240, 0.5)";
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[110] pointer-events-none h-1.5 w-1.5 rounded-full bg-race-red opacity-0"
        aria-hidden
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[110] pointer-events-none h-9 w-9 rounded-full border opacity-0 transition-[border-color] duration-200"
        style={{ borderColor: "rgba(244,244,240,0.5)" }}
        aria-hidden
      />
    </>
  );
}
