import { Suspense, useMemo, memo } from 'react';
import { useTexture, ContactShadows } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Wallpaper, RoomId, RoomConfig } from '../../types';

// ─── Room configs ────────────────────────────────────────────────────────────
export const ROOMS: Record<RoomId, RoomConfig> = {
  living:  { id:'living',  name:'Mehmonxona',      icon:'🛋️', W:8,   H:3.2, D:7,   cameraPos:[2,1.9,4.8],  cameraTarget:[0,1.3,-0.5] },
  bedroom: { id:'bedroom', name:'Yotoqxona',        icon:'🛏️', W:6.5, H:2.9, D:5.5, cameraPos:[1.5,1.7,4],  cameraTarget:[0,1.1,-0.5] },
  kitchen: { id:'kitchen', name:'Oshxona',          icon:'🍳', W:7,   H:2.9, D:5.5, cameraPos:[2,1.8,4.2],  cameraTarget:[0,1.2,-0.8] },
  kids:    { id:'kids',    name:"Bolalar xonasi",   icon:'🎠', W:5,   H:2.7, D:5,   cameraPos:[1,1.5,3.8],  cameraTarget:[0,0.9,-0.3] },
  hall:    { id:'hall',    name:'Hall',             icon:'🚪', W:3.5, H:3,   D:8,   cameraPos:[0,1.7,6],    cameraTarget:[0,1.5,0]    },
  stair:   { id:'stair',   name:'Zina maydoni',     icon:'🪜', W:5,   H:5.5, D:5.5, cameraPos:[2,2.5,4.5],  cameraTarget:[0,2.5,-0.5] },
  tv:      { id:'tv',      name:'TV xona',          icon:'📺', W:7.5, H:3.1, D:6.5, cameraPos:[2,1.8,5],    cameraTarget:[0,1.3,-0.5] },
};

// ─── Helper: get texture URL from wallpaper ──────────────────────────────────
export const getTextureUrl = (w: Wallpaper | null): string | null => {
  if (!w) return null;
  const B = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:8000';
  if (w.texture) return `${B}${w.texture}`;
  if (w.images?.[0]) return `${B}${w.images[0]}`;
  return null;
};

// ─── Primitive helpers ───────────────────────────────────────────────────────
interface BoxProps {
  pos: [number, number, number];
  size: [number, number, number];
  col?: string;
  rough?: number;
  metal?: number;
  rot?: [number, number, number];
  emit?: string;
  emitIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}

export const Box = memo(({
  pos, size, col = '#fff', rough = 0.8, metal = 0,
  rot = [0,0,0], emit, emitIntensity = 0.5, transparent, opacity = 1
}: BoxProps) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial
      color={col} roughness={rough} metalness={metal}
      emissive={emit || '#000000'} emissiveIntensity={emit ? emitIntensity : 0}
      transparent={transparent} opacity={opacity}
    />
  </mesh>
));

interface CylProps {
  pos: [number, number, number];
  r: number; h: number;
  col?: string; rough?: number; metal?: number;
  rot?: [number, number, number];
}
export const Cyl = memo(({ pos, r, h, col='#fff', rough=0.8, metal=0, rot=[0,0,0] }: CylProps) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <cylinderGeometry args={[r, r, h, 16]} />
    <meshStandardMaterial color={col} roughness={rough} metalness={metal} />
  </mesh>
));

export const Sphere = memo(({ pos, r, col='#fff', rough=0.8, metal=0, emit, emitIntensity=0.5 }: {
  pos:[number,number,number]; r:number; col?:string; rough?:number; metal?:number; emit?:string; emitIntensity?:number;
}) => (
  <mesh position={pos} castShadow receiveShadow>
    <sphereGeometry args={[r, 16, 16]} />
    <meshStandardMaterial color={col} roughness={rough} metalness={metal}
      emissive={emit || '#000000'} emissiveIntensity={emit ? emitIntensity : 0} />
  </mesh>
));

// ─── Physical scale helpers ───────────────────────────────────────────────────
// Standard European roll width — used whenever a wallpaper has no parseable
// `width` value, so an unusual admin entry never crashes the repeat math.
const DEFAULT_ROLL_WIDTH_M = 1.06;

// Parses roll-width strings like "1.06m", "106cm", "53 cm", "1,06", "106"
// into meters. Admins type this as free text, so this has to be forgiving.
function parseRollWidthMeters(value: string | undefined): number {
  if (!value) return DEFAULT_ROLL_WIDTH_M;
  const match = value.replace(',', '.').match(/([\d.]+)\s*(cm|m)?/i);
  if (!match) return DEFAULT_ROLL_WIDTH_M;
  const num = parseFloat(match[1]);
  if (!isFinite(num) || num <= 0) return DEFAULT_ROLL_WIDTH_M;
  const unit = match[2]?.toLowerCase();
  if (unit === 'cm') return num / 100;
  if (unit === 'm') return num;
  // No unit given — roll widths are always ~40–160cm or ~0.4–1.6m, so the
  // magnitude alone tells us which one the admin meant.
  return num > 5 ? num / 100 : num;
}

// ─── Wall components ─────────────────────────────────────────────────────────
interface WallInnerProps {
  wallpaper: Wallpaper; url: string; pos:[number,number,number]; rot:[number,number,number];
  w: number; h: number; scale: number; texRot: number;
}

function TexturedWall({ wallpaper, url, pos, rot, w, h, scale, texRot }: WallInnerProps) {
  const tex = useTexture(url);
  const { gl } = useThree();
  useMemo(() => {
    const image = tex.image as { width?: number; height?: number } | undefined;
    const rollWidthM = parseRollWidthMeters(wallpaper.width);
    const imageAspect = image?.width && image?.height ? image.width / image.height : 1;
    // The physical height of one tile is derived from the source photo's own
    // aspect ratio, not guessed — this is what keeps flowers round and
    // patterns square instead of stretching them to fit the wall.
    const patternHeightM = rollWidthM / imageAspect;

    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set((w / rollWidthM) / scale, (h / patternHeightM) / scale);
    tex.rotation = texRot;
    tex.center.set(0.5, 0.5);

    // Full-quality sampling: correct color space, max anisotropic filtering
    // (sharpens the pattern when the orbit camera views a wall at an angle),
    // and mipmapped trilinear filtering so zooming in/out never aliases.
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = gl.capabilities.getMaxAnisotropy();
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
  }, [tex, wallpaper, w, h, scale, texRot, gl]);

  return (
    <mesh position={pos} rotation={rot} receiveShadow>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} roughness={0.85} />
    </mesh>
  );
}

interface WallProps {
  wallpaper: Wallpaper | null;
  pos: [number,number,number];
  rot: [number,number,number];
  w: number; h: number;
  col?: string;
  scale?: number;
  texRot?: number;
}

export function Wall({ wallpaper, pos, rot, w, h, col = '#ede9e4', scale = 1, texRot = 0 }: WallProps) {
  const plain = (
    <mesh position={pos} rotation={rot} receiveShadow>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial color={col} roughness={0.92} />
    </mesh>
  );
  const textureUrl = getTextureUrl(wallpaper);
  if (!textureUrl || !wallpaper) return plain;
  return (
    <Suspense fallback={plain}>
      <TexturedWall wallpaper={wallpaper} url={textureUrl} pos={pos} rot={rot} w={w} h={h} scale={scale} texRot={texRot} />
    </Suspense>
  );
}

// ─── Floor ───────────────────────────────────────────────────────────────────
export function Floor({ W, D, col = '#c4b09a' }: { W:number; D:number; col?:string }) {
  return (
    <>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={col} roughness={0.9} metalness={0.02} />
      </mesh>
      {/* Soft contact-shadow pass grounds furniture — scene is static so a
          single baked frame is enough, keeping this essentially free at runtime. */}
      <ContactShadows
        position={[0, 0.004, 0]}
        opacity={0.55}
        scale={Math.max(W, D) * 1.4}
        blur={2.6}
        far={2.4}
        resolution={512}
        frames={1}
      />
    </>
  );
}

// ─── Room lighting ────────────────────────────────────────────────────────────
export function RoomLights({ warm = true }: { warm?: boolean }) {
  return (
    <>
      {/* Hemisphere light gives a natural sky/ground gradient instead of a flat fill */}
      <hemisphereLight
        color={warm ? '#fff6e8' : '#eaf2ff'}
        groundColor={warm ? '#3a2f22' : '#1c2230'}
        intensity={0.55}
      />
      <directionalLight
        position={[4, 6, 4]} intensity={1.6} castShadow color="#fff8f0"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5} shadow-camera-far={30}
        shadow-camera-left={-8} shadow-camera-right={8}
        shadow-camera-top={8} shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
        shadow-radius={4}
      />
      <directionalLight position={[-3, 4, -3]} intensity={0.4} color="#c8d8ff" />
      <pointLight position={[0, 2.8, 0]} intensity={0.3} color="#ffeecc" />
    </>
  );
}
