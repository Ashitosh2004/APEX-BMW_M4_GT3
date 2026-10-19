"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useInView, animate } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Split-character masked reveal for headlines                        */
/* ------------------------------------------------------------------ */
export function Chars({
  text,
  className,
  delay = 0,
  stagger = 0.028,
  once = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, margin: "-12% 0px" });

  return (
    <span ref={ref} className={className} aria-label={text} role="text">
      {text.split(" ").map((word, w) => (
        <span
          key={w}
          aria-hidden
          className="inline-block whitespace-nowrap align-bottom"
        >
          {word.split("").map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: "115%", rotate: 6, opacity: 0 }}
                animate={
                  inView
                    ? { y: "0%", rotate: 0, opacity: 1 }
                    : { y: "115%", rotate: 6, opacity: 0 }
                }
                transition={{
                  duration: 0.7,
                  delay: delay + (w * 3 + i) * stagger,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
          {/* real space between words so wrapping happens at word bounds */}
          <span className="inline-block overflow-hidden">
            <motion.span
              className="inline-block"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.01, delay: delay + (w * 3 + word.length) * stagger }}
            >
              &nbsp;
            </motion.span>
          </span>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Generic reveal wrapper                                             */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 36,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated number counter                                            */
/* ------------------------------------------------------------------ */
export function Counter({
  to,
  decimals = 0,
  suffix,
  prefix,
  className,
  duration = 1.6,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = `${prefix ?? ""}${v.toFixed(decimals)}${suffix ?? ""}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, decimals, suffix, prefix, duration]);

  return (
    <span ref={ref} className={className}>
      {`${prefix ?? ""}0${suffix ?? ""}`}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Infinite marquee ticker                                            */
/* ------------------------------------------------------------------ */
export function Marquee({
  items,
  className = "",
  reverse = false,
  duration = 28,
  separator = "//",
}: {
  items: string[];
  className?: string;
  reverse?: boolean;
  duration?: number;
  separator?: string;
}) {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span className="whitespace-nowrap px-6">{it}</span>
          <span className="text-race-red px-2 font-semibold">{separator}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ ["--marquee-dur" as string]: `${duration}s` }}
    >
      <div
        className={`flex w-max ${reverse ? "animate-marquee-rev" : "animate-marquee"}`}
      >
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section header (vertical index + rule)                             */
/* ------------------------------------------------------------------ */
export function SectionTag({
  index,
  label,
  align = "left",
}: {
  index: string;
  label: string;
  align?: "left" | "right";
}) {
  return (
    <Reveal
      className={`flex items-center gap-4 ${align === "right" ? "flex-row-reverse" : ""}`}
      y={12}
    >
      <span className="font-display text-xs font-bold tracking-[0.3em] text-race-red">
        {index}
      </span>
      <span className="h-px w-16 bg-race-red/70" />
      <span className="hud-label">{label}</span>
    </Reveal>
  );
}
