"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Chars, Reveal, SectionTag } from "@/components/racing/reveal";
import { Activity, Gauge, Fuel, Thermometer } from "lucide-react";

/* ---------------- live sensor readout (rAF, no re-renders) ------------- */
function LiveSensor({
  icon: Icon,
  label,
  unit,
  base,
  amp,
  decimals = 0,
}: {
  icon: typeof Gauge;
  label: string;
  unit: string;
  base: number;
  amp: number;
  decimals?: number;
}) {
  const valRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    /* last-written strings — skip DOM writes/layout when unchanged */
    let lastVal = "";
    let lastBar = "";
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = (performance.now() - t0) / 1000;
      const wobble =
        Math.sin(t * 0.9) * 0.6 + Math.sin(t * 2.3 + 1.7) * 0.3 + Math.sin(t * 5.1) * 0.1;
      const v = base + amp * wobble;
      const valStr = `${v.toFixed(decimals)}${unit}`;
      if (valStr !== lastVal) {
        lastVal = valStr;
        if (valRef.current) valRef.current.textContent = valStr;
      }
      if (barRef.current) {
        const pct = Math.min(100, Math.max(4, ((v - (base - amp * 2)) / (amp * 4)) * 100));
        const barStr = `${Math.round(pct)}%`;
        if (barStr !== lastBar) {
          lastBar = barStr;
          barRef.current.style.width = barStr;
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [base, amp, decimals, unit]);

  return (
    <div className="brackets border border-white/10 bg-carbon-2/80 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 font-tech text-[10px] tracking-[0.22em] text-white/60">
          <Icon className="w-3.5 h-3.5 text-race-red" /> {label}
        </span>
        <span
          ref={valRef}
          className="font-display text-sm font-bold tabular-nums text-white"
        >
          {base.toFixed(decimals)}
          {unit}
        </span>
      </div>
      <div className="h-[3px] bg-white/10 overflow-hidden">
        <div
          ref={barRef}
          className="h-full bg-race-red"
          style={{ width: "50%" }}
        />
      </div>
    </div>
  );
}

const CARDS = [
  {
    title: "HYBRID CHASSIS",
    body: "Steel-aluminium hybrid construction with a carbon-fibre roof and adjustable aero mounts — torsional rigidity tuned for GT3 balance of performance.",
  },
  {
    title: "SAFETY CELL",
    body: "FIA-homologated steel safety cage, rescue hatch in the roof and a seat-position based on Formula 1 learnings. Survival first, speed always.",
  },
  {
    title: "P58 ENGINE",
    body: "4.0-litre twin-turbo inline six with a closed-deck block. Developed from the road-car S58 to endure multi-stint endurance flat-out running.",
  },
  {
    title: "RACE ELECTRONICS",
    body: "Cosworth-powered ECU, live telemetry back to the pit wall, traction maps switchable mid-stint by the driver without lifting a finger off the wheel.",
  },
];

export default function Telemetry() {
  return (
    <section
      id="telemetry"
      aria-label="Engineering and telemetry"
      className="relative h-[200vh]"
    >
      <div className="sticky top-0 h-screen flex items-center">
        <div className="absolute inset-y-0 left-0 w-[46vw] bg-gradient-to-r from-carbon via-carbon/60 to-transparent pointer-events-none" />

        <div className="relative px-16 w-full max-w-6xl">
          <SectionTag index="04" label="ENGINEERING" />

          <h2 className="mt-6 font-display font-black leading-[0.95] text-[clamp(40px,5.4vw,84px)]">
            <Chars text="WEAPON-GRADE" className="block" />
            <Chars text="ENGINEERING" className="block text-outline" delay={0.18} />
          </h2>

          <div className="mt-10 grid grid-cols-[1.1fr_1fr] gap-10 items-start">
            {/* left: tech cards */}
            <div className="grid grid-cols-2 gap-4">
              {CARDS.map((c, i) => (
                <Reveal
                  key={c.title}
                  delay={0.1 * i}
                  className="group relative border border-white/10 bg-carbon/85 p-5 hover:border-race-red/50 transition-colors"
                >
                  <span className="font-display text-[10px] font-bold tracking-[0.3em] text-race-red">
                    0{i + 1}
                  </span>
                  <h3 className="mt-2 font-display text-sm font-bold tracking-[0.14em] text-white">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-white/50">
                    {c.body}
                  </p>
                  <span className="absolute bottom-0 left-0 h-px w-0 bg-race-red transition-all duration-500 group-hover:w-full" />
                </Reveal>
              ))}
            </div>

            {/* right: live telemetry panel */}
            <Reveal delay={0.2}>
              <div className="relative border border-white/10 bg-carbon/90 overflow-hidden">
                <div className="scanline" />
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                  <span className="flex items-center gap-2 font-tech text-[10px] tracking-[0.25em] text-white/70">
                    <Activity className="w-3.5 h-3.5 text-race-red animate-blink" />
                    LIVE TELEMETRY
                  </span>
                  <span className="font-tech text-[10px] tracking-[0.2em] text-race-red border border-race-red/40 px-2 py-0.5">
                    MAP: QUALIFYING
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-5">
                  <LiveSensor
                    icon={Thermometer}
                    label="WATER TEMP"
                    unit="°C"
                    base={92}
                    amp={2.4}
                  />
                  <LiveSensor
                    icon={Thermometer}
                    label="OIL TEMP"
                    unit="°C"
                    base={104}
                    amp={3.1}
                  />
                  <LiveSensor
                    icon={Gauge}
                    label="BOOST PRESSURE"
                    unit=" bar"
                    base={1.42}
                    amp={0.14}
                    decimals={2}
                  />
                  <LiveSensor
                    icon={Fuel}
                    label="FUEL LEVEL"
                    unit="L"
                    base={38}
                    amp={1.8}
                    decimals={1}
                  />
                </div>

                <div className="border-t border-white/10 px-5 py-3 flex items-center justify-between">
                  <span className="font-tech text-[10px] tracking-[0.2em] text-white/40">
                    CAR #46 // LINK STABLE
                  </span>
                  <span className="flex items-center gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-race-red"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.18,
                        }}
                      />
                    ))}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-white/40">
                Simulation only. In the real GT3, this data streams from the
                Cosworth ECU to engineers who watch every degree of oil
                temperature across a 24-hour race.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
