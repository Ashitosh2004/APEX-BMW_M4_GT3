"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  PerformanceMonitor,
  useGLTF,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { scrollState, smoothstep, lerp, clamp01 } from "@/lib/scroll-state";

/* ------------------------------------------------------------------ */
/*  Camera choreography — keyframes along scroll progress              */
/* ------------------------------------------------------------------ */
type Key = { p: number; pos: [number, number, number]; look: [number, number, number] };

/** facing correction — tuned after visual check (0 = front points +Z) */
const CAR_ROT_Y = 0;

const KEYS: Key[] = [
  // 01 IGNITION — hero front three-quarter
  { p: 0.0, pos: [3.9, 1.5, 6.4], look: [0, 0.55, 0.3] },
  // 02 POWER — pure side profile sweep
  { p: 0.22, pos: [7.4, 0.9, 0.2], look: [0, 0.55, 0] },
  // 03 AERO — low rear angle, wing hero shot
  { p: 0.45, pos: [-3.4, 0.85, -5.6], look: [0, 0.85, -1.0] },
  // 04 TELEMETRY — high top-down over the hood
  { p: 0.68, pos: [2.6, 5.0, 3.2], look: [0, 0.1, -0.6] },
  // 05 LEGACY — low frontal, monster stance
  { p: 0.88, pos: [0.9, 0.62, 6.9], look: [0, 0.6, 0.6] },
  { p: 1.0, pos: [2.6, 1.25, 5.9], look: [0, 0.55, 0.4] },
];

function CameraRig() {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(...KEYS[0].pos));
  const look = useRef(new THREE.Vector3(...KEYS[0].look));
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpLook = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    camera.position.copy(pos.current);
  }, [camera]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.06);
    const p = clamp01(scrollState.progress);

    // find surrounding keyframes
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
    const a = KEYS[i];
    const b = KEYS[i + 1];
    const t = smoothstep(clamp01((p - a.p) / (b.p - a.p || 1)));

    tmpPos.set(
      lerp(a.pos[0], b.pos[0], t),
      lerp(a.pos[1], b.pos[1], t),
      lerp(a.pos[2], b.pos[2], t)
    );
    tmpLook.set(
      lerp(a.look[0], b.look[0], t),
      lerp(a.look[1], b.look[1], t),
      lerp(a.look[2], b.look[2], t)
    );

    // mouse parallax (subtle)
    tmpPos.x += scrollState.mouseX * 0.35;
    tmpPos.y += -scrollState.mouseY * 0.18;

    // critically-damped follow
    const l = 3.2;
    pos.current.x = THREE.MathUtils.damp(pos.current.x, tmpPos.x, l, d);
    pos.current.y = THREE.MathUtils.damp(pos.current.y, tmpPos.y, l, d);
    pos.current.z = THREE.MathUtils.damp(pos.current.z, tmpPos.z, l, d);
    look.current.x = THREE.MathUtils.damp(look.current.x, tmpLook.x, l, d);
    look.current.y = THREE.MathUtils.damp(look.current.y, tmpLook.y, l, d);
    look.current.z = THREE.MathUtils.damp(look.current.z, tmpLook.z, l, d);

    // idle breathing when at top
    const breathe = Math.sin(performance.now() * 0.0006) * 0.06 * (1 - clamp01(p * 8));
    camera.position.set(
      pos.current.x,
      pos.current.y + breathe,
      pos.current.z
    );
    camera.lookAt(look.current);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Geometry merging — 2,264 meshes → one draw call per material       */
/* ------------------------------------------------------------------ */
const KEEP_ATTRS = new Set(["position", "normal", "uv"]);

/** bake world transform + normalize attributes; returns a merge-ready geometry */
function bakeGeometry(mesh: THREE.Mesh): THREE.BufferGeometry | null {
  let geo = mesh.geometry;
  if (!geo || !geo.attributes?.position) return null;

  const hasInterleaved = Object.values(geo.attributes).some(
    (a) =>
      !!(a as unknown as { isInterleavedBufferAttribute?: boolean })
        .isInterleavedBufferAttribute
  );
  if (hasInterleaved) {
    // toNonInterleaved exists at runtime but is missing from @types/three
    geo = (
      geo as unknown as { toNonInterleaved(): THREE.BufferGeometry }
    ).toNonInterleaved();
  }

  // bake the node's world transform into the vertices
  mesh.updateWorldMatrix(true, false);
  geo.applyMatrix4(mesh.matrixWorld);

  // strip everything except position/normal/uv so attribute sets are compatible
  for (const name of Object.keys(geo.attributes)) {
    if (!KEEP_ATTRS.has(name)) geo.deleteAttribute(name);
  }
  if (!geo.attributes.normal) geo.computeVertexNormals();
  geo.morphAttributes = {};
  return geo;
}

/**
 * Statically merges every mesh of the GLB into one Mesh per material.
 * The model has no animations/skins, so this is visually 1:1 while
 * cutting ~2,264 draw calls (×3 render passes) down to ~#materials.
 */
function buildMergedCar(source: THREE.Object3D): THREE.Group {
  const cached = source.userData.mergedGroup as THREE.Group | undefined;
  if (cached) return cached;

  source.updateMatrixWorld(true);

  type Bucket = { geos: THREE.BufferGeometry[]; mat: THREE.Material };
  const buckets = new Map<string, Bucket>();
  const keep: THREE.Object3D[] = [];
  const consumed: THREE.BufferGeometry[] = [];

  source.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry || !mesh.material) return;
    // never merge anything animated, instanced or multi-material
    if (
      (mesh as THREE.SkinnedMesh).isSkinnedMesh ||
      (mesh as THREE.InstancedMesh).isInstancedMesh ||
      Array.isArray(mesh.material) ||
      (mesh.geometry.morphAttributes &&
        Object.keys(mesh.geometry.morphAttributes).length > 0)
    ) {
      keep.push(mesh);
      return;
    }

    const baked = bakeGeometry(mesh);
    if (!baked) {
      keep.push(mesh);
      return;
    }
    consumed.push(mesh.geometry);

    const attrs = Object.keys(baked.attributes).sort().join("+");
    const key = `${(mesh.material as THREE.Material).uuid}|${attrs}|${baked.index ? 1 : 0}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { geos: [], mat: mesh.material as THREE.Material };
      buckets.set(key, bucket);
    }
    bucket.geos.push(baked);
  });

  const out = new THREE.Group();
  for (const b of buckets.values()) {
    try {
      if (b.geos.length === 1) {
        const m = new THREE.Mesh(b.geos[0], b.mat);
        m.matrixAutoUpdate = false;
        out.add(m);
      } else {
        const merged = mergeGeometries(b.geos, false);
        if (!merged) throw new Error("merge failed");
        merged.computeBoundingSphere();
        const m = new THREE.Mesh(merged, b.mat);
        m.matrixAutoUpdate = false;
        out.add(m);
        for (const g of b.geos) g.dispose();
      }
    } catch {
      // graceful fallback: render the baked meshes individually
      for (const g of b.geos) {
        const m = new THREE.Mesh(g, b.mat);
        m.matrixAutoUpdate = false;
        out.add(m);
      }
    }
  }
  keep.forEach((m) => out.add(m));

  // release the now-consumed original GPU buffers
  consumed.forEach((g) => g.dispose());

  source.userData.mergedGroup = out;
  return out;
}

/* ------------------------------------------------------------------ */
/*  Car model — merged, materials enhanced, shaders pre-warmed         */
/* ------------------------------------------------------------------ */
function CarModel({ rotationY = 0 }: { rotationY?: number }) {
  const { scene } = useGLTF("/models/m4gt3.glb");
  const { gl, scene: stageScene, camera, invalidate } = useThree();
  const group = useRef<THREE.Group>(null);
  const car = useMemo(() => buildMergedCar(scene), [scene]);

  useEffect(() => {
    // normalize the merged group: center on origin, length = 5.0, wheels on floor
    // (guard: never re-apply on top of an already-normalized transform)
    if (!car.userData.normalized) {
      car.userData.normalized = true;
      const box = new THREE.Box3().setFromObject(car);
      if (!box.isEmpty()) {
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = 5.0 / Math.max(size.x, size.z);
        car.scale.setScalar(scale);
        car.position.x = -center.x * scale;
        car.position.z = -center.z * scale;
        car.position.y = -box.min.y * scale;
      }
    }

    // polish materials (deduped — materials are shared across merged meshes)
    const maxAniso = Math.min(4, gl.capabilities.getMaxAnisotropy());
    const seen = new Set<THREE.Material>();
    car.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat || seen.has(mat)) return;
      seen.add(mat);

      const name = (mat.name || "").toLowerCase();
      if (name.includes("paint")) {
        mat.metalness = 0.72;
        mat.roughness = 0.24;
        mat.envMapIntensity = 1.5;
        if ("clearcoat" in mat) {
          (mat as THREE.MeshPhysicalMaterial).clearcoat = 1;
          (mat as THREE.MeshPhysicalMaterial).clearcoatRoughness = 0.06;
        }
      } else if (name.includes("window") || name.includes("glass")) {
        mat.metalness = 0.4;
        mat.roughness = 0.05;
        mat.envMapIntensity = 2.2;
      } else if (name.includes("carbon") || name.includes("kevlar")) {
        mat.roughness = 0.42;
        mat.envMapIntensity = 1.1;
      } else if (name.includes("wheel") || name.includes("calliper")) {
        mat.metalness = Math.max(mat.metalness, 0.55);
        mat.envMapIntensity = 1.25;
      } else {
        mat.envMapIntensity = Math.min(mat.envMapIntensity ?? 1, 1.05);
      }
      if (mat.map) mat.map.anisotropy = maxAniso;
      mat.needsUpdate = true;
    });

    // pre-compile programs while the preloader is still covering the canvas
    try {
      gl.compile(stageScene, camera);
    } catch {
      /* older three — non-fatal */
    }
    invalidate();
  }, [car, gl, stageScene, camera, invalidate]);

  return (
    <group ref={group} rotation-y={rotationY}>
      <primitive object={car} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  GPU tier detection — software rasterizers get a lite pipeline      */
/* ------------------------------------------------------------------ */
function detectSoftwareGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") ||
      c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))
      : "";
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    return true;
  }
}

const IS_SOFTWARE_GL =
  typeof window !== "undefined" && detectSoftwareGL();

/** ?freeze=1 → demand frameloop with periodic invalidation (low-power mode) */
const FREEZE_MODE =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("freeze");
const FREEZE_MODE_SLOW_MS = 1500;

/* ------------------------------------------------------------------ */
/*  Warmup — renders a few frames behind the opaque preloader so the   */
/*  env cubemap, reflection FBO and shader programs are ready before   */
/*  reveal (no first-frame hitch).                                     */
/* ------------------------------------------------------------------ */
function Warmup() {
  const { invalidate } = useThree();
  useEffect(() => {
    let n = 0;
    // a handful of frames is enough: env cubemap + reflection first pass
    // (shaders are pre-compiled synchronously via gl.compile in CarModel)
    const id = setInterval(() => {
      n += 1;
      if (n > (FREEZE_MODE ? 40 : 4)) {
        clearInterval(id);
        return;
      }
      invalidate();
    }, FREEZE_MODE ? FREEZE_MODE_SLOW_MS : 350);
    return () => clearInterval(id);
  }, [invalidate]);
  return null;
}

/* ------------------------------------------------------------------ */
/*  KickStart — force one frame when the preloader lifts so the        */
/*  demand→always frameloop handover can never leave a blank canvas    */
/* ------------------------------------------------------------------ */
function KickStart({ ready }: { ready: boolean }) {
  const { invalidate } = useThree();
  useEffect(() => {
    if (ready) invalidate();
  }, [ready, invalidate]);
  return null;
}

/* ------------------------------------------------------------------ */
/*  Scene                                                              */
/* ------------------------------------------------------------------ */
function Scene({ ready }: { ready: boolean }) {
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 14, 34]} />

      {!ready && <Warmup />}
      <KickStart ready={ready} />
      <CameraRig />
      <CarModel rotationY={CAR_ROT_Y} />

      {/* reflective showroom floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <circleGeometry args={[36, 72]} />
        <MeshReflectorMaterial
          blur={IS_SOFTWARE_GL ? [60, 20] : [160, 50]}
          resolution={IS_SOFTWARE_GL ? 256 : 512}
          mixBlur={1}
          mixStrength={IS_SOFTWARE_GL ? 4 : 9}
          roughness={0.92}
          depthScale={0}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.3}
          color="#070708"
          metalness={0.55}
          mirror={IS_SOFTWARE_GL ? 0.3 : 0.55}
        />
      </mesh>

      {/* grounding shadow */}
      <ContactShadows
        key="csh"
        position={[0, 0.02, 0]}
        opacity={0.82}
        scale={16}
        blur={2.4}
        far={4}
        resolution={IS_SOFTWARE_GL ? 192 : 256}
        color="#000000"
      />

      {/* start/finish glow ring under the car */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 0]}>
        <ringGeometry args={[4.6, 4.72, 96]} />
        <meshBasicMaterial color="#e10600" transparent opacity={0.32} />
      </mesh>

      {/* lights */}
      <ambientLight intensity={0.16} />
      <spotLight
        position={[5, 8, 6]}
        angle={0.5}
        penumbra={1}
        intensity={1.35}
        color="#ffffff"
      />
      <spotLight
        position={[-7, 4, -6]}
        angle={0.6}
        penumbra={1}
        intensity={2.2}
        color="#e10600"
      />
      <pointLight position={[0, 2, 9]} intensity={0.5} color="#ffb300" />

      {/* studio lightformers (no external HDR needed) */}
      <Environment resolution={IS_SOFTWARE_GL ? 128 : 256}>
        <color attach="background" args={["#0a0a0a"]} />
        <Lightformer
          form="rect"
          intensity={2.4}
          position={[0, 6, 0]}
          rotation-x={Math.PI / 2}
          scale={[12, 4, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[0, 6, -6]}
          rotation-x={Math.PI / 2}
          scale={[8, 2, 1]}
          color="#dfe6ff"
        />
        <Lightformer
          form="rect"
          intensity={3.2}
          position={[-6, 2.2, 0]}
          rotation-y={Math.PI / 2}
          scale={[12, 1.6, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="rect"
          intensity={4}
          position={[6.5, 1.6, 0]}
          rotation-y={-Math.PI / 2}
          scale={[12, 1.2, 1]}
          color="#e10600"
        />
        <Lightformer
          form="circle"
          intensity={2}
          position={[0, 2.5, 8]}
          scale={[3, 3, 1]}
          color="#ffd9a0"
        />
      </Environment>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported canvas wrapper                                            */
/* ------------------------------------------------------------------ */
export default function CarScene({ ready = false }: { ready?: boolean }) {
  const lite = IS_SOFTWARE_GL;
  const [dpr, setDpr] = useState(lite ? 0.85 : 1.4);

  return (
    <div className="fixed inset-0 z-0" aria-hidden data-scene-lite={lite}>
      <Canvas
        dpr={lite ? [0.6, 1] : dpr}
        frameloop={FREEZE_MODE ? "demand" : ready ? "always" : "demand"}
        camera={{ fov: 30, position: KEYS[0].pos, near: 0.1, far: 80 }}
        gl={{
          antialias: !lite,
          powerPreference: "high-performance",
          alpha: false,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          // exposed for perf diagnostics
          (window as unknown as { __APEX_GL?: unknown }).__APEX_GL = gl.info;
        }}
      >
        <Suspense fallback={null}>
          <Scene ready={ready} />
        </Suspense>
        {!lite && (
          <EffectComposer multisampling={0}>
            <Bloom
              mipmapBlur
              intensity={0.5}
              luminanceThreshold={0.85}
              luminanceSmoothing={0.25}
            />
            <Vignette offset={0.22} darkness={0.82} />
          </EffectComposer>
        )}
        {/* adaptive resolution — kicks in after reveal so preloader-time
            sparse frames don't skew the fps estimate */}
        {!lite && ready && !FREEZE_MODE && (
          <PerformanceMonitor
            flipflops={3}
            onIncline={() => setDpr(1.5)}
            onDecline={() => setDpr(1.1)}
            onFallback={() => setDpr(0.9)}
          />
        )}
      </Canvas>
    </div>
  );
}

if (typeof window !== "undefined") {
  useGLTF.preload("/models/m4gt3.glb");
}
