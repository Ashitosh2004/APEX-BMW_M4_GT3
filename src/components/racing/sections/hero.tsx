"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Chars, Marquee } from "@/components/racing/reveal";

const TICKER = [
  "590 HP",
  "4.0L TWIN-TURBO I6",
  "0–100 IN 3.0S",
  "GT3 CLASS",
  "WEIGHT 1,300 KG",
  "9,000 RPM REDLINE",
  "XTRAC 6-SPEED",
];

export default function Hero({ ready }: { ready: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "48%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="ignition"
      aria-label="Hero — BMW M4 GT3"
      className="relative h-[170vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* backdrop wash so title reads over the 3D scene */}
        <div className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-carbon via-carbon/55 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-[46vw] bg-gradient-to-r from-carbon/80 via-carbon/30 to-transparent pointer-events-none" />

        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="absolute inset-0 flex flex-col justify-end pb-24 px-16"
        >
          {/* season chip */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={ready ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mb-6 flex items-center gap-4"
          >
            <span className="border border-race-red/70 bg-race-red/10 px-3 py-1 font-tech text-[10px] tracking-[0.3em] text-race-red">
              2022 SEASON DEBUT
            </span>
            <span className="hud-label">BMW MOTORSPORT // CUSTOMER RACING</span>
          </motion.div>

          {/* main title */}
          <h1 className="font-display font-black leading-[0.86]">
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: "110%" }}
                animate={ready ? { y: "0%" } : {}}
                transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="block text-[clamp(72px,11vw,190px)] tracking-tight skew-italic"
              >
                BMW M4
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: "110%" }}
                animate={ready ? { y: "0%" } : {}}
                transition={{ delay: 0.58, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="block text-[clamp(72px,11vw,190px)] tracking-tight skew-italic text-outline-red"
              >
                GT3
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.85, duration: 0.7 }}
            className="mt-7 max-w-md text-sm leading-relaxed text-white/60"
          >
            The apex predator of GT racing. Five hundred ninety horsepower of
            twin-turbo brutality, sculpted by wind-tunnel obsession — now
            rendered live, 2,264 meshes deep, in your browser.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.0, duration: 0.7 }}
            className="mt-9 flex items-center gap-5"
          >
            <button
              onClick={() =>
                document.getElementById("power")?.scrollIntoView({ behavior: "smooth" })
              }
              className="group relative overflow-hidden bg-race-red px-8 py-3.5 font-tech text-xs font-semibold tracking-[0.28em] text-white cursor-pointer"
              data-hover
            >
              <span className="absolute inset-0 translate-x-[-101%] bg-white transition-transform duration-300 ease-out group-hover:translate-x-0" />
              <span className="relative transition-colors group-hover:text-carbon">
                EXPLORE THE MACHINE
              </span>
            </button>
            <div className="flex items-center gap-3 text-white/45">
              <span className="font-tech text-[10px] tracking-[0.25em]">
                DRAG NOTHING. JUST SCROLL.
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* giant ghost numeral backdrop */}
        <motion.span
          style={{ opacity: titleOpacity }}
          className="pointer-events-none absolute -right-6 top-16 font-display text-[26vw] font-black leading-none text-outline-faint select-none"
          aria-hidden
        >
          3
        </motion.span>

        {/* scroll cue */}
        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="hud-label">SCROLL TO IGNITE</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4 text-race-red" />
          </motion.div>
        </motion.div>

        {/* bottom ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-0 inset-x-0 border-t border-white/10 bg-carbon/85"
        >
          <Marquee
            items={TICKER}
            className="py-3 font-tech text-xs tracking-[0.25em] text-white/70"
            duration={30}
          />
        </motion.div>
      </div>
    </section>
  );
}
