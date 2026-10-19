"use client";

import { Chars, Reveal, SectionTag, Marquee } from "@/components/racing/reveal";
import { ArrowUpRight, Flag } from "lucide-react";

const HONORS = [
  { year: "2022", title: "DTM CHAMPIONS", detail: "Sheldon van der Linde // Schubert Motorsport" },
  { year: "2022", title: "DEBUT AT NÜRBURGRING", detail: "NLS series shakedown, straight into the fight" },
  { year: "2024", title: "NÜRBURGRING 24H VICTORY", detail: "Rowe Racing conquers the Green Hell" },
  { year: "2025", title: "DAYTONA 24H VICTORY", detail: "WRT takes the Rolex 24 on American soil" },
  { year: "GLOBAL", title: "GT WORLD CHALLENGE WINS", detail: "Race victories across four continents" },
];

const FOOTER_TICKER = [
  "NO SUBSTITUTE",
  "FOR POWER",
  "BORN ON THE GRID",
  "BUILT FOR GLORY",
  "M4 GT3",
];

export default function Legacy() {
  return (
    <section id="legacy" aria-label="Racing legacy and contact" className="relative">
      {/* honors */}
      <div className="relative h-[130vh]">
        <div className="sticky top-0 h-screen flex items-center">
          <div className="absolute inset-y-0 right-0 w-[40vw] bg-gradient-to-l from-carbon via-carbon/55 to-transparent pointer-events-none" />
          <div className="relative px-16 w-full max-w-4xl ml-auto">
            <div className="flex justify-end">
              <SectionTag index="05" label="RACING LEGACY" align="right" />
            </div>

            <h2 className="mt-6 font-display font-black leading-[0.95] text-[clamp(40px,5.4vw,84px)] text-right">
              <Chars text="BORN ON THE" className="block" />
              <Chars text="GRID." className="block text-outline-red" delay={0.18} />
            </h2>

            <div className="mt-10 space-y-0">
              {HONORS.map((h, i) => (
                <Reveal key={h.title + h.year} delay={0.08 * i} y={24}>
                  <div
                    className="group flex items-center gap-6 border-t border-white/10 py-5 px-4 -mx-4 hover:bg-race-red/5 transition-colors"
                    data-hover
                  >
                    <span className="font-display text-xs font-bold tracking-[0.2em] text-race-red w-16 shrink-0">
                      {h.year}
                    </span>
                    <span className="font-display text-lg xl:text-xl font-bold tracking-wide text-white group-hover:translate-x-2 transition-transform duration-300">
                      {h.title}
                    </span>
                    <span className="ml-auto font-tech text-[11px] tracking-[0.12em] text-white/40 text-right hidden md:block">
                      {h.detail}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-race-red group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                </Reveal>
              ))}
              <div className="border-t border-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA + footer */}
      <div className="relative bg-carbon border-t border-white/10 tech-grid">
        <div className="max-w-6xl mx-auto px-16 py-24">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div>
              <Reveal y={16}>
                <span className="flex items-center gap-2 hud-label !text-race-red mb-5">
                  <Flag className="w-3.5 h-3.5" /> FINAL SECTOR
                </span>
              </Reveal>
              <h3 className="font-display font-black leading-[0.95] text-[clamp(36px,4.6vw,72px)]">
                <Chars text="READY TO" className="block" />
                <Chars text="HIT THE TRACK?" className="block text-outline" delay={0.15} />
              </h3>
              <Reveal delay={0.25} className="mt-5 max-w-md text-sm leading-relaxed text-white/55">
                Customer racing teams around the world run the M4 GT3. Reserve
                a test day, meet the engineers, and feel the twin-turbo shove
                for yourself.
              </Reveal>
            </div>

            <Reveal delay={0.2} className="flex flex-col items-start lg:items-end gap-5">
              <div className="relative animate-glow">
                <button
                  className="group relative overflow-hidden bg-race-red px-10 py-4 font-tech text-sm font-semibold tracking-[0.28em] text-white cursor-pointer"
                  data-hover
                >
                  <span className="absolute inset-0 translate-y-[101%] bg-white transition-transform duration-300 ease-out group-hover:translate-y-0" />
                  <span className="relative flex items-center gap-3 transition-colors group-hover:text-carbon">
                    REQUEST A TEST LAP
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
              <span className="font-tech text-[10px] tracking-[0.22em] text-white/35">
                {"PIT WALL // CONCEPT SHOWCASE — NO REAL BOOKINGS"}
              </span>
            </Reveal>
          </div>
        </div>

        {/* marquee divider */}
        <Marquee
          items={FOOTER_TICKER}
          reverse
          duration={34}
          className="border-y border-white/10 py-5 font-display text-3xl xl:text-4xl font-black tracking-wide text-outline-faint"
        />

        {/* footer bar */}
        <footer className="px-16 py-8 flex flex-wrap items-center justify-between gap-4">
          <span className="font-display text-sm font-black tracking-[0.25em]">
            APEX<span className="text-race-red">{"//"}</span>GT3
          </span>
          <span className="font-tech text-[10px] tracking-[0.18em] text-white/35 text-center">
            UNOFFICIAL FAN CONCEPT. BMW, M4 AND GT3 ARE TRADEMARKS OF BMW AG.
          </span>
          <span className="font-tech text-[10px] tracking-[0.22em] text-white/35">
            © 2026 APEX CONCEPT LAB
          </span>
        </footer>
      </div>
    </section>
  );
}
