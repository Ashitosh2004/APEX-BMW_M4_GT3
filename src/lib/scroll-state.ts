/**
 * Module-level singleton shared between the DOM world (page, HUD)
 * and the WebGL world (camera rig). Written via refs each frame,
 * never triggers React re-renders.
 */
export const scrollState = {
  /** 0..1 progress across the whole page */
  progress: 0,
  /** smoothed scroll velocity (px/frame), signed */
  velocity: 0,
  /** normalized mouse position -1..1 */
  mouseX: 0,
  mouseY: 0,
  /** true once the preloader has finished */
  ready: false,
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const smoothstep = (t: number) => t * t * (3 - 2 * t);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
