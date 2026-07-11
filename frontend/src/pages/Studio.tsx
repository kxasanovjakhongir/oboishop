import { Suspense, useRef, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, BakeShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ROOMS } from '../components/studio/BaseRoom';
import RoomSelector from '../components/studio/RoomSelector';
import ControlPanel from '../components/studio/ControlPanel';
import LivingRoom from '../components/studio/rooms/LivingRoom';
import Bedroom from '../components/studio/rooms/Bedroom';
import Kitchen from '../components/studio/rooms/Kitchen';
import KidsRoom from '../components/studio/rooms/KidsRoom';
import Hall from '../components/studio/rooms/Hall';
import StairHall from '../components/studio/rooms/StairHall';
import TVRoom from '../components/studio/rooms/TVRoom';
import useStore from '../store/useStore';
import { getWallpapers } from '../api';

const ROOM_COMPONENTS = {
  living:  LivingRoom,
  bedroom: Bedroom,
  kitchen: Kitchen,
  kids:    KidsRoom,
  hall:    Hall,
  stair:   StairHall,
  tv:      TVRoom,
} as const;

function LoadingBox() {
  return (
    <>
      <ambientLight intensity={1} />
      <mesh rotation={[0.5, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff6600" />
      </mesh>
    </>
  );
}

export default function Studio() {
  const glRef = useRef<any>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const lastTapRef = useRef(0);
  const [searchParams] = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);
  const {
    currentRoom, wallTextures, textureScale, textureRotation,
    setSelectedWallpaper, applyWallpaper, targetWall,
  } = useStore();

  // Double-tap/double-click anywhere on the canvas resets the camera —
  // OrbitControls has no built-in gesture for this, so it's tracked here
  // via a plain timestamp check rather than pulling in a gesture library.
  const handleCanvasPointerDown = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) controlsRef.current?.reset();
    lastTapRef.current = now;
  }, []);

  useEffect(() => {
    const id = searchParams.get('wallpaper');
    if (!id) return;
    getWallpapers()
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : [];
        const found = list.find((w: { _id: string }) => w._id === id);
        if (found) { setSelectedWallpaper(found); applyWallpaper(found, targetWall); }
      })
      .catch(() => null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roomConfig = ROOMS[currentRoom] ?? ROOMS.living;
  const RoomComponent = ROOM_COMPONENTS[currentRoom] ?? ROOM_COMPONENTS.living;

  const takeScreenshot = useCallback(() => {
    const canvas = glRef.current?.domElement as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `studio-${currentRoom}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  }, [currentRoom]);

  return (
    /* Outer wrapper — explicit 100vw × 100vh, no flex weirdness */
    <div style={{ position: 'fixed', inset: 0, display: 'flex', background: '#0b132b' }}>

      {/* ── LEFT: canvas fills entire height, topbar overlays ── */}
      <div
        style={{ position: 'relative', flex: 1, overflow: 'hidden', minWidth: 0, touchAction: 'none' }}
        onPointerDown={handleCanvasPointerDown}
      >

        {/* Canvas — fills parent 100% */}
        <Canvas
          shadows="soft"
          frameloop="demand"
          dpr={[1, 2]}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          camera={{
            position: roomConfig.cameraPos as [number, number, number],
            fov: 60,
            near: 0.1,
            far: 100,
          }}
          onCreated={({ gl }) => { glRef.current = gl; }}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <Suspense fallback={<LoadingBox />}>
            <RoomComponent t={wallTextures} scale={textureScale} texRot={textureRotation} />
          </Suspense>
          <OrbitControls
            ref={controlsRef}
            target={roomConfig.cameraTarget as [number, number, number]}
            maxPolarAngle={Math.PI / 1.8}
            minDistance={1.5}
            maxDistance={12}
            enableDamping
            dampingFactor={0.05}
            touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
          />
          {/* Scene has no per-frame animation, so shadows only need to be
              computed once — this removes a real per-frame GPU cost. */}
          <BakeShadows />
        </Canvas>

        {/* Topbar — absolute overlay on top of canvas, padded below the notch */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, paddingTop: 'env(safe-area-inset-top)' }}
          className="bg-orange-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-3 sm:px-4 py-2 gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 overflow-hidden">
            <span className="text-white font-bold text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
              <span className="text-orange-400">Wallpaper</span> Studio 3D
            </span>
            <div className="w-px h-5 bg-white/20 flex-shrink-0" />
            <RoomSelector />
          </div>
          <button onClick={takeScreenshot}
            className="flex-shrink-0 flex items-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto justify-center sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/25 rounded-xl text-white text-xs font-semibold transition-colors touch-manipulation">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Screenshot</span>
          </button>
        </div>

        {/* Bottom hint — mouse instructions on desktop, touch gestures on mobile */}
        <div
          style={{ position: 'absolute', left: 16, zIndex: 20, bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          className="hidden sm:block bg-orange-950/70 backdrop-blur-sm rounded-xl px-3 py-2 text-white/60 text-xs pointer-events-none"
        >
          🖱️ Aylantirish &nbsp;|&nbsp; ⚙️ Scroll: zoom &nbsp;|&nbsp; ✋ O'ng: siljitish
        </div>
        <div
          style={{ position: 'absolute', left: 12, zIndex: 20, bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          className="sm:hidden bg-orange-950/70 backdrop-blur-sm rounded-xl px-2.5 py-1.5 text-white/60 text-[11px] pointer-events-none"
        >
          👆 Aylantirish &nbsp;|&nbsp; 🤏 Zoom/Siljitish
        </div>

        {/* Mobile-only FAB — reopens the wallpaper/settings sheet once closed */}
        {!panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
            className="lg:hidden absolute right-4 z-30 w-14 h-14 rounded-full bg-orange-600 text-white shadow-2xl shadow-black/40 flex items-center justify-center text-2xl active:scale-95 transition-transform touch-manipulation"
            aria-label="Oboy tanlash"
          >
            🎨
          </button>
        )}

        {/* Backdrop behind the mobile bottom-sheet */}
        {panelOpen && (
          <div
            onClick={() => setPanelOpen(false)}
            className="lg:hidden absolute inset-0 z-[25] bg-black/50 backdrop-blur-sm"
          />
        )}
      </div>

      {/* ── RIGHT: control panel — bottom sheet on mobile, static sidebar on desktop ── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 transition-transform duration-300 ease-out
          lg:static lg:inset-auto lg:transition-none lg:translate-y-0
          ${panelOpen ? 'translate-y-0' : 'translate-y-[110%]'}`}
      >
        <ControlPanel onClose={() => setPanelOpen(false)} />
      </div>
    </div>
  );
}
