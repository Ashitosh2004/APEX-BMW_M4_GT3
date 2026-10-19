"use client";

import { motion } from "framer-motion";
import { Chars, Reveal, SectionTag, Counter } from "@/components/racing/reveal";

const BARS = [
  { label: "DOWNFORCE @ 250 KM/H", value: 88, readout: "480 KG" },
  { label: "HIGH-SPEED CORNER GRIP", value: 91, readout: "2.9 G" },
  { label: "BRAKING STABILITY", value: 84, readout: "1.8 G" },
  { label: "DRAG EFFICIENCY INDEX", value: 76, readout: "0.62 CD" },
];

export default function Aero() {
  return (
    <section id="aero" aria-label="Aerodynamics" className="relative h-[190vh]">
      <div className="sticky top-0 h-screen flex items-center justify-end">
        <div className="absolute inset-y-0 right-0 w-[46vw] bg-gradient-to-l from-carbon via-carbon/60 to-transparent pointer-events-none" />

        <div className="relative px-16 max-w-2xl w-full">
          <div className="flex justify-end">
            <SectionTag index="03" label="AERODYNAMICS" align="right" />
          </div>

          <h2 className="mt-6 font-display font-black leading-[0.95] text-[clamp(40px,5.4vw,84px)] text-right">
            <Chars text="SCULPTED BY" className="block" />
            <Chars
              text="THE WIND"
              className="block text-outline-red"
              delay={0.18}
            />
          </h2>

          <Reveal
            delay={0.3}
            className="mt-7 ml-auto max-w-xl text-sm leading-relaxed text-white/60 text-right"
          >
            Every surface is a weapon. The swan-neck rear wing mounts from
            above for undisturbed airflow underneath, feeding a rear diffuser
            that sucks the car onto the tarmac. Up front, a deep splitter and
            adjustable dive planes balance the equation — aerodynamics you can
            feel through the wheel at 250 km/h.
          </Reveal>

          {/* animated bars */}
          <div className="mt-10 space-y-5">
            {BARS.map((b, i) => (
              <div key={b.label} className="group">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-tech text-[10px] tracking-[0.28em] text-white/70">
                    {b.label}
                  </span>
                  <span className="font-display text-sm font-bold tabular-nums text-race-red">
                    {b.readout}
                  </span>
                </div>
                <div className="relative h-[6px] bg-white/8 overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: b.value / 100 }}
                    viewport={{ once: true, margin: "-15% 0px" }}
                    transition={{
                      duration: 1.3,
                      delay: 0.15 * i,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 origin-left bg-gradient-to-r from-race-red-dim via-race-red to-race-red"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + 0.15 * i }}
                    className="absolute top-0 bottom-0 w-[2px] bg-white/90"
                    style={{ left: `${b.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Reveal delay={0.4} className="mt-8 flex items-center justify-end gap-6">
            <span className="font-display text-3xl font-black text-white/90 tabular-nums">
              <Counter to={480} suffix=" KG" />
            </span>
            <span className="hud-label text-right !text-white/50">
              TOTAL DOWNFORCE
              <br />
              AT TOP SPEED
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
