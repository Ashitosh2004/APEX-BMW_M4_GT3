"use client";

import { Chars, Counter, Reveal, SectionTag } from "@/components/racing/reveal";

const SPECS = [
  { value: 590, suffix: "", unit: "HP", label: "PEAK POWER", note: "BoP-dependent" },
  { value: 700, suffix: "", unit: "NM", label: "PEAK TORQUE", note: "4.0L P58 block" },
  { value: 3.0, suffix: "S", unit: "", label: "0–100 KM/H", decimals: 1, note: "Launch control" },
  { value: 1300, suffix: "", unit: "KG", label: "RACE WEIGHT", note: "With driver" },
];

export default function Power() {
  return (
    <section id="power" aria-label="Powertrain" className="relative h-[190vh]">
      <div className="sticky top-0 h-screen flex items-center">
        <div className="absolute inset-y-0 left-0 w-[44vw] bg-gradient-to-r from-carbon via-carbon/60 to-transparent pointer-events-none" />

        <div className="relative px-16 max-w-3xl">
          <SectionTag index="02" label="POWERTRAIN" />

          <h2 className="mt-6 font-display font-black leading-[0.95] text-[clamp(40px,5.4vw,84px)]">
            <Chars text="BRUTAL. PRECISE." className="block" />
            <Chars
              text="RELENTLESS."
              className="block text-outline"
              delay={0.18}
            />
          </h2>

          <Reveal delay={0.3} className="mt-7 max-w-xl text-sm leading-relaxed text-white/60">
            At its heart sits the P58 — a 4.0-litre twin-turbocharged inline-six
            descended from the road-going S58 but rebuilt for endurance war.
            A closed-deck block, mono turbocharger configuration and race
            calibration deliver a wide, drivable torque plateau that lasts a
            full 24-hour stint, not just one hero lap.
          </Reveal>

          {/* spec grid */}
          <div className="mt-10 grid grid-cols-2 gap-px bg-white/10 border border-white/10">
            {SPECS.map((s, i) => (
              <Reveal
                key={s.label}
                delay={0.12 * i}
                className="group relative bg-carbon/90 p-6 hover:bg-carbon-2 transition-colors"
              >
                <span className="absolute left-0 top-0 h-full w-[2px] bg-race-red scale-y-0 origin-top transition-transform duration-500 group-hover:scale-y-100" />
                <div className="flex items-baseline gap-1.5">
                  <Counter
                    to={s.value}
                    decimals={s.decimals ?? 0}
                    className="font-display text-4xl xl:text-5xl font-black tabular-nums text-white"
                  />
                  <span className="font-display text-lg font-bold text-race-red">
                    {s.unit}
                  </span>
                </div>
                <div className="mt-2 font-tech text-[10px] tracking-[0.28em] text-white/70">
                  {s.label}
                </div>
                <div className="mt-0.5 font-tech text-[10px] tracking-[0.14em] text-white/35">
                  {s.note}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.5} className="mt-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-white/10" />
            <span className="hud-label">DTM CHAMPIONSHIP-WINNING POWERTRAIN</span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
