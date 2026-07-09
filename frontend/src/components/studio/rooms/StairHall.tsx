import { Box, Cyl, Wall, Floor, RoomLights } from '../BaseRoom';
import { Environment } from '@react-three/drei';
import type { WallTextures } from '../../../types';

const W=5, H=5.5, D=5.5;

export default function StairHall({ t, scale=1, texRot=0 }: { t:WallTextures; scale?:number; texRot?:number }) {
  const p={scale,texRot};
  return (
    <>
      <ambientLight intensity={0.4} color="#f5f0e8" />
      <directionalLight position={[3,8,3]} intensity={2.0} castShadow color="#fff8f0"
        shadow-mapSize={[2048,2048]} shadow-camera-far={30} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={12} shadow-camera-bottom={-4} />
      <directionalLight position={[-2,5,-2]} intensity={0.5} color="#c8d8ff" />
      <Environment preset="sunset" />

      {/* Double-height walls */}
      <Wall wallpaper={t.back}  pos={[0,H/2,-D/2]}   rot={[0,0,0]}         w={W} h={H} {...p} />
      <Wall wallpaper={t.left}  pos={[-W/2,H/2,0]}   rot={[0,Math.PI/2,0]} w={D} h={H} {...p} />
      <Wall wallpaper={t.right} pos={[W/2,H/2,0]}    rot={[0,-Math.PI/2,0]}w={D} h={H} {...p} />
      <Wall wallpaper={t.front} pos={[0,H/2,D/2]}    rot={[0,Math.PI,0]}   w={W} h={H} {...p} />
      <Floor W={W} D={D} col="#e0d8cc" />

      {/* Upper ceiling */}
      <Box pos={[0,H+0.01,0]} size={[W,0.06,D]} col="#f8f5f0" rough={1} metal={0} />

      {/* ═══ STAIRCASE (left side going up) ═══ */}
      {[...Array(10)].map((_, i) => (
        <>
          {/* Step tread */}
          <Box key={`t${i}`} pos={[-1.0+i*0.0, 0.16*(i+1), -D/2+0.55+i*0.5]} size={[2.0,0.16,0.5]} col="#e8ddd0" rough={0.8} />
          {/* Step riser */}
          <Box key={`r${i}`} pos={[-1.0+i*0.0, 0.08*(2*i+1), -D/2+0.35+i*0.5]} size={[2.0,0.16*(i+1),0.08]} col="#ddd0c0" rough={0.7} />
        </>
      ))}
      {/* Stair platform (landing) */}
      <Box pos={[-1.0,1.7,2.0]}   size={[2.0,0.16,1.5]}    col="#e8ddd0" rough={0.8} />

      {/* ═══ RAILING ═══ */}
      {/* Handrail */}
      <Box pos={[-0.0,1.2,-D/2+3.0]} size={[0.06,0.06,5.8]} col="#8a6a4a" rough={0.5} rot={[0.18,0,0]} />
      {/* Balusters */}
      {[...Array(8)].map((_, i) => (
        <Box key={i} pos={[-0.0, 0.5+i*0.18, -D/2+0.8+i*0.55]} size={[0.04,0.8,0.04]} col="#a08060" rough={0.6} />
      ))}
      {/* Newel posts */}
      <Box pos={[0,0.6,-D/2+0.6]}  size={[0.08,1.2,0.08]}  col="#6a4a2a" rough={0.7} />
      <Box pos={[0,1.5,2.6]}       size={[0.08,0.8,0.08]}  col="#6a4a2a" rough={0.7} />

      {/* Right side railing (balcony) */}
      <Box pos={[W/2-0.04,2.8,0]}  size={[0.06,0.06,D]}    col="#8a6a4a" rough={0.5} />
      {[...Array(7)].map((_,i)=>(
        <Box key={i} pos={[W/2-0.04,2.2,-D/2+0.4+i*0.75]} size={[0.04,1.2,0.04]} col="#a08060" rough={0.6} />
      ))}

      {/* ═══ LARGE WINDOW (back wall, high up) ═══ */}
      <Box pos={[1.2,3.5,-D/2+0.02]} size={[1.8,2.0,0.06]}  col="#c8e8f8" rough={0} metal={0.2} transparent opacity={0.4} />
      <Box pos={[1.2,3.5,-D/2+0.03]} size={[0.05,2.0,0.05]} col="#d4c8b0" rough={0.6} />
      <Box pos={[1.2,3.5,-D/2+0.03]} size={[1.8,0.05,0.05]} col="#d4c8b0" rough={0.6} />
      <pointLight position={[1.2,4.0,-D/2+2.0]} intensity={1.5} color="#fff0d8" distance={8} />

      {/* Ground floor window */}
      <Box pos={[1.5,1.5,-D/2+0.02]} size={[1.2,1.2,0.04]}  col="#c8e8f8" rough={0} metal={0.1} transparent opacity={0.4} />
      <Box pos={[1.5,1.5,-D/2+0.03]} size={[0.04,1.2,0.04]} col="#d4c8b0" rough={0.6} />
      <Box pos={[1.5,1.5,-D/2+0.03]} size={[1.2,0.04,0.04]} col="#d4c8b0" rough={0.6} />

      {/* ═══ PENDANT CHANDELIER (high ceiling) ═══ */}
      <Box pos={[0,H-0.02,0]} size={[0.02,1.8,0.02]} col="#888" rough={0.3} metal={0.8} />
      <Box pos={[0,H-2.1,0]} size={[0.8,0.04,0.04]} col="#c8a060" rough={0.2} metal={0.8} />
      <Box pos={[0,H-2.1,0]} size={[0.04,0.04,0.8]} col="#c8a060" rough={0.2} metal={0.8} />
      {[[-0.4,0],[0.4,0],[0,-0.4],[0,0.4]].map(([x,z],i)=>(
        <>
          <Cyl key={`s${i}`} pos={[x,H-2.5,z]} r={0.12} h={0.2} col="#f5e8d0" rough={0.4} />
          <pointLight key={`l${i}`} position={[x,H-2.6,z]} intensity={0.6} color="#ffe8aa" distance={3} />
        </>
      ))}
      <pointLight position={[0,H-2.5,0]} intensity={1.5} color="#ffe4aa" distance={8} />

      {/* ═══ WALL ART ═══ */}
      <Box pos={[-W/2+0.03,3.5,0]}  size={[0.04,1.0,1.4]}  col="#f8f2e8" rough={0.5} />
      <Box pos={[-W/2+0.04,3.5,0]}  size={[0.02,0.9,1.3]}  col="#c8b090" rough={0.4} />

      {/* Plant at base */}
      <Cyl pos={[W/2-0.4,0.35,D/2-0.5]} r={0.25} h={0.6} col="#6a4f38" rough={0.9} />
      <Box pos={[W/2-0.4,0.85,D/2-0.5]} size={[0.55,0.65,0.55]} col="#2d6626" rough={1.0} />

      {/* Baseboard */}
      <Box pos={[0,0.04,-D/2+0.02]} size={[W,0.08,0.04]} col="#c8c0b5" rough={0.7} />
      <Box pos={[-W/2+0.02,0.04,0]} size={[0.04,0.08,D]} col="#c8c0b5" rough={0.7} />
      <Box pos={[W/2-0.02,0.04,0]}  size={[0.04,0.08,D]} col="#c8c0b5" rough={0.7} />
    </>
  );
}
