"use client";

import { useEffect, useRef } from "react";
import { scrollState, clamp01 } from "@/lib/scroll-state";

const SECTIONS = [
  { id: "ignition", num: "01", label: "IGNITION", range: [0.0, 0.16] },
  { id: "power", num: "02", label: "POWER", range: [0.16, 0.36] },
  { id: "aero", num: "03", label: "AERO", range: [0.36, 0.56] },
  { id: "telemetry", num: "04", label: "TELEMETRY", range: [0.56, 0.78] },
  { id: "legacy", num: "05", label: "LEGACY", range: [0.78, 1.01] },
];

const MAX_RPM = 7600;
const IDLE_RPM = 950;
const SEGMENTS = 26;

export default function Hud({ ready }: { ready: boolean }) {
  const fillRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const rpmNumRef = useRef<HTMLSpanElement>(null);
  const gearRef = useRef<HTMLSpanElement>(null);
  const segRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeRef = useRef<(HTMLDivElement | null)[]>([]);
  const rpm = useRef(IDLE_RPM);
  const activeSection = useRef("ignition");

  useEffect(() => {
    let raf = 0;
    /* last-written values — skip DOM writes when nothing changed */
    let lastFill = -1;
    let lastPct = -1;
    let lastRpm = -1;
    let lastLit = -1;
    let lastGear = "";

    const loop = () => {
      raf = requestAnimationFrame(loop);
      /* natural decay — useVelocity keeps its last value when scroll stops */
      scrollState.velocity *= 0.93;
      const p = clamp01(scrollState.progress);

      /* left progress rail */
      if (fillRef.current && Math.abs(p - lastFill) > 0.0015) {
        lastFill = p;
        fillRef.current.style.transform = `scaleY(${p})`;
      }
      const pct = Math.round(p * 100);
      if (pct !== lastPct && pctRef.current) {
        lastPct = pct;
        pctRef.current.textContent = `${String(pct).padStart(3, "0")}%`;
      }

      /* RPM follows scroll velocity ("scroll = throttle") */
      const target = IDLE_RPM + Math.min(1, Math.abs(scrollState.velocity) / 55) * (MAX_RPM - IDLE_RPM);
      rpm.current += (target - rpm.current) * 0.09;
      const frac = rpm.current / MAX_RPM;

      const rpmShown = Math.round(rpm.current / 10) * 10;
      if (rpmShown !== lastRpm && rpmNumRef.current) {
        lastRpm = rpmShown;
        rpmNumRef.current.textContent = String(rpmShown).padStart(4, "0");
      }

      const lit = Math.ceil(frac * SEGMENTS);
      if (lit !== lastLit) {
        lastLit = lit;
        segRefs.current.forEach((seg, i) => {
          if (!seg) return;
          const on = i < lit;
          seg.style.opacity = on ? "1" : "0.13";
          seg.style.background = i / SEGMENTS > 0.78
            ? "#e10600"
            : i / SEGMENTS > 0.6
              ? "#ffb300"
              : "#f4f4f0";
        });
      }

      /* gear from progress */
      const gear = p < 0.015 ? "N" : String(Math.min(6, 1 + Math.floor(p * 6.4)));
      if (gear !== lastGear && gearRef.current) {
        lastGear = gear;
        gearRef.current.textContent = gear;
      }

      /* active section indicator */
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        if (p >= s.range[0] && p < s.range[1]) {
          current = s.id;
          break;
        }
      }
      if (current !== activeSection.current) {
        activeSection.current = current;
        activeRef.current.forEach((el) => {
          if (!el) return;
          const isActive = el.dataset.id === current;
          el.dataset.active = String(isActive);
        });
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-40 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
      aria-hidden={false}
    >
      {/* ---------------- top nav ---------------- */}
      <header className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between px-8 py-5">
        <a
          href="#ignition"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("ignition");
          }}
          className="group flex items-baseline gap-1"
          aria-label="APEX home"
        >
          <span className="font-display text-lg font-900 font-black tracking-widest">
            APEX
          </span>
          <span className="font-display text-lg font-black text-race-red">{"//"}</span>
          <span className="font-display text-xs font-semibold tracking-[0.25em] text-white/70 group-hover:text-white transition-colors">
            M4&nbsp;GT3
          </span>
        </a>

        <nav className="hidden items-center gap-8" aria-label="Sections">
          {SECTIONS.slice(1).map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="hud-label hover:text-white transition-colors cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => scrollTo("legacy")}
          className="group relative border border-race-red px-5 py-2 font-tech text-[11px] font-semibold tracking-[0.28em] text-white overflow-hidden cursor-pointer"
        >
          <span className="absolute inset-0 translate-y-full bg-race-red transition-transform duration-300 ease-out group-hover:translate-y-0" />
          <span className="relative">BOOK A LAP</span>
        </button>
      </header>

      {/* ---------------- left progress rail ---------------- */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
        <span className="hud-label vertical-rl !tracking-[0.4em]">LAP</span>
        <div className="relative h-44 w-px bg-white/12 overflow-hidden">
          <div
            ref={fillRef}
            className="absolute inset-0 origin-top bg-race-red"
            style={{ transform: "scaleY(0)" }}
          />
        </div>
        <span
          ref={pctRef}
          className="font-tech text-[10px] tracking-widest text-white/60 tabular-nums"
        >
          000%
        </span>
      </div>

      {/* ---------------- right section indicator ---------------- */}
      <nav
        className="pointer-events-auto absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-5"
        aria-label="Section shortcuts"
      >
        {SECTIONS.map((s) => (
          <div
            key={s.id}
            ref={(el) => {
              activeRef.current[SECTIONS.indexOf(s)] = el;
            }}
            data-id={s.id}
            data-active={s.id === "ignition"}
            className="group flex cursor-pointer items-center justify-end gap-3"
            onClick={() => scrollTo(s.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && scrollTo(s.id)}
            aria-label={`Go to ${s.label}`}
          >
            <span className="font-tech text-[10px] tracking-[0.25em] text-white/35 group-hover:text-white/80 transition-all data-[active=true]:text-race-red opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 data-[active=true]:opacity-100 data-[active=true]:translate-x-0">
              {s.num} {s.label}
            </span>
            <span className="h-px w-7 bg-white/25 transition-all duration-300 group-hover:w-10 group-hover:bg-white/70 group-data-[active=true]:w-10 group-data-[active=true]:bg-race-red" />
          </div>
        ))}
      </nav>

      {/* ---------------- bottom-right RPM gauge ---------------- */}
      <div className="absolute bottom-7 right-8 flex flex-col items-end gap-1.5">
        <div className="flex items-baseline gap-3">
          <span className="hud-label">SCROLL&nbsp;=&nbsp;THROTTLE</span>
          <span
            ref={rpmNumRef}
            className="font-display text-xl font-bold tabular-nums text-white animate-flicker"
          >
            0950
          </span>
          <span className="hud-label !text-white/40">RPM</span>
        </div>
        <div className="flex items-end gap-[3px] h-4" aria-hidden>
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                segRefs.current[i] = el;
              }}
              className="w-[5px]"
              style={{
                height: i / SEGMENTS > 0.6 ? "100%" : "68%",
                background: "#f4f4f0",
                opacity: 0.13,
                transition: "opacity 60ms linear",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="hud-label">GEAR</span>
          <span
            ref={gearRef}
            className="font-display text-sm font-bold text-race-red border border-race-red/60 px-2 py-0.5 min-w-7 text-center tabular-nums"
          >
            N
          </span>
        </div>
      </div>

      {/* ---------------- bottom-left telemetry chip ---------------- */}
      <div className="absolute bottom-7 left-8 flex items-center gap-3">
        <span className="h-2 w-2 bg-race-red animate-blink" />
        <span className="hud-label !text-white/60">
          {"LIVE RENDER // WEBGL 2.0"}
        </span>
      </div>
    </div>
  );
}
