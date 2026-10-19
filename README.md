<div align="center">

<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23050505'/%3E%3Cpath d='M6 22 L14 8 L18 8 L10 22 Z' fill='%23e10600'/%3E%3Cpath d='M16 22 L24 8 L28 8 L20 22 Z' fill='%23ffffff'/%3E%3C/svg%3E" width="56" alt="APEX" />

# APEX — BMW M4 GT3

### An immersive 3D racing landing page UI

**A high-impact landing page design concept** that turns the BMW M4 GT3 into a
cinematic, scroll-driven web experience. Five visual acts, a live 3D car scene,
and a racing-inspired telemetry HUD — all built to put the car in the spotlight.

<br>

[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-087ea4?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Three.js r186](https://img.shields.io/badge/Three.js-r186-050505?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-e10600?style=for-the-badge&logo=framer&logoColor=white)](https://motion.dev)

<br>

**DESKTOP-FIRST** &nbsp;·&nbsp; **WEBGL 2** &nbsp;·&nbsp; **3D STORYTELLING** &nbsp;·&nbsp; **ZERO BACKEND**

</div>

---

## At a glance

|  |  |
| --- | --- |
| **Project** | Immersive landing page UI design for the BMW M4 GT3 |
| **Experience** | One continuous scroll, five cinematic sections |
| **3D pipeline** | 2,264 model meshes merged to approximately 48 draw calls |
| **Built with** | Next.js 16, React 19, React Three Fiber, Three.js and Tailwind CSS v4 |
| **Designed for** | Desktop browsers with WebGL 2 support |

## The experience

The page unfolds like a race weekend — from first reveal to final credits.

| Act | Section | Landing page moment |
| :-: | --- | --- |
| **01** | **HERO** | A boot sequence leads into a studio-lit M4 GT3 reveal |
| **02** | **POWER** | 590 HP and twin-turbo stats arrive with a cinematic camera push |
| **03** | **AERO** | Sculpted bodywork close-ups meet bold, split-character headlines |
| **04** | **TELEMETRY** | Gauges, animated counters and a focused specification grid |
| **05** | **LEGACY** | A marquee outro, call to action and credits close the story |

A persistent racing HUD adds an RPM gauge driven by scroll velocity, a gear
indicator, a lap rail and a section tracker.

## Get started

> [!IMPORTANT]
> Requires **Node.js 20+** (or **Bun 1.1+**) and a GPU/browser with **WebGL 2** support.

```bash
# Install dependencies
bun install

# Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and let the boot sequence
take you to the grid. If port 3000 is already in use, start Next.js on another
port with `bunx next dev -p 3001`.

> **Deployment note:** The BMW model at `public/models/m4gt3.glb` is required
> for the 3D scene and is intentionally included in Git. Keep it in the
> repository when pushing so Vercel can serve it.

### Production

```bash
# Build the standalone application
bun run build

# Serve the production build
bun run start
```

### Command reference

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server on port 3000 |
| `bun run build` | Create the optimized standalone production build |
| `bun run start` | Run the standalone production server |
| `bun run lint` | Run ESLint across the project |

## Design and interaction

- **Cinematic art direction** — a dark studio palette, racing-red accents,
  oversized type and subtle grain give the page a motorsport identity.
- **Scroll-led storytelling** — each section pairs copy and motion with a
  purposeful camera move around the 3D car.
- **Always-on telemetry** — a custom cursor and HUD keep the racing motif
  present throughout the landing page.
- **Desktop-first presentation** — the experience checks for mobile devices
  and presents a desktop-required screen.

## Performance details

| Optimization | Implementation |
| --- | --- |
| **Geometry merging** | Merge 2,264 GLB meshes per material, reducing roughly 6,800 draw calls to about 48 per frame |
| **Adaptive resolution** | `PerformanceMonitor` caps pixel ratio at 1.5 and scales down on weaker GPUs |
| **Demand rendering** | Rendering idles during the preloader before the scene warms up |
| **Change-gated DOM** | Per-frame HUD and cursor updates are diff-checked to avoid unnecessary writes |
| **Lean post-processing** | MSAA and redundant noise are removed; CSS grain supplies the texture |

To try demand-render mode, add `?freeze=1` to the page URL:

```text
http://localhost:3000/?freeze=1
```

## Project structure

```text
src/
├── app/
│   ├── layout.tsx              # Fonts, metadata and favicon
│   ├── page.tsx                # Scroll state, preloader and page sections
│   └── globals.css             # Tailwind v4 theme and visual effects
├── components/racing/
│   ├── car-scene.tsx           # 3D scene, camera, lighting and effects
│   ├── preloader.tsx           # Animated boot sequence and asset progress
│   ├── hud.tsx                 # RPM, gear, lap and section telemetry
│   ├── cursor.tsx              # Custom crosshair cursor
│   ├── mobile-gate.tsx         # Desktop-required screen
│   ├── reveal.tsx              # Text and number reveal primitives
│   └── sections/               # Hero, power, aero, telemetry and legacy
└── lib/
    └── scroll-state.ts         # Shared scroll and pointer state
public/
└── models/m4gt3.glb            # BMW M4 GT3 model
```

## Configuration

- Next.js DevTools indicator is hidden in development with
  `devIndicators: false` in `next.config.ts`.
- React strict mode is disabled with `reactStrictMode: false` for stable R3F
  double-mount behavior.
- Next.js standalone output is enabled for portable deployment.

---

<div align="center">

**A landing page UI concept built with** Next.js · React Three Fiber · drei ·
postprocessing · Framer Motion · Tailwind CSS

*Designed to make the M4 GT3 feel fast before it even hits the track.*

</div>
