import { Box, Cyl, Wall, Floor, RoomLights } from '../BaseRoom';
import { Environment } from '@react-three/drei';
import type { WallTextures } from '../../../types';

const W=7, H=2.9, D=5.5;

export default function Kitchen({ t, scale=1, texRot=0 }: { t:WallTextures; scale?:number; texRot?:number }) {
  const p={scale,texRot};
  return (
    <>
      <RoomLights />
      <Environment preset="city" />

      <Wall wallpaper={t.back}  pos={[0,H/2,-D/2]}   rot={[0,0,0]}         w={W} h={H} {...p} />
      <Wall wallpaper={t.left}  pos={[-W/2,H/2,0]}   rot={[0,Math.PI/2,0]} w={D} h={H} {...p} />
      <Wall wallpaper={t.right} pos={[W/2,H/2,0]}    rot={[0,-Math.PI/2,0]}w={D} h={H} {...p} />
      <Wall wallpaper={t.front} pos={[0,H/2,D/2]}    rot={[0,Math.PI,0]}   w={W} h={H} {...p} />
      <Floor W={W} D={D} col="#e8e0d5" />
      <Box pos={[0,H+0.01,0]} size={[W,0.05,D]} col="#f8f8f5" rough={1} metal={0} />

      {/* ═══ LOWER CABINETS (back wall) ═══ */}
      <Box pos={[0,0.45,-D/2+0.32]}  size={[W-0.5,0.9,0.6]}   col="#f0ece8" rough={0.6} />
      <Box pos={[0,0.9,-D/2+0.02]}   size={[W-0.5,0.05,0.65]}  col="#d8d0c8" rough={0.2} metal={0.3} />
      {/* Cabinet doors back */}
      {[-2.4,-1.2,0,1.2,2.4].map((x,i)=>(
        <Box key={i} pos={[x,0.45,-D/2+0.35]} size={[1.05,0.82,0.04]} col="#e8e4df" rough={0.4} />
      ))}
      {/* Handles */}
      {[-2.4,-1.2,0,1.2,2.4].map((x,i)=>(
        <Cyl key={i} pos={[x,0.45,-D/2+0.38]} r={0.015} h={0.28} col="#888" rough={0.2} metal={0.9} rot={[Math.PI/2,0,0]} />
      ))}

      {/* ═══ UPPER CABINETS (back wall) ═══ */}
      <Box pos={[0,2.1,-D/2+0.2]}    size={[W-0.5,0.7,0.4]}   col="#f0ece8" rough={0.6} />
      {[-2.4,-1.2,0,1.2,2.4].map((x,i)=>(
        <Box key={i} pos={[x,2.1,-D/2+0.22]} size={[1.05,0.62,0.04]} col="#e8e4df" rough={0.4} />
      ))}
      {/* Under-cabinet lights */}
      <Box pos={[0,1.75,-D/2+0.22]}  size={[W-0.6,0.04,0.04]} col="#fff" emit="#fffae0" emitIntensity={1.5} />
      <pointLight position={[0, 1.6, -D/2+0.5]} intensity={0.6} color="#fffae0" distance={4} />

      {/* ═══ LEFT WALL CABINETS ═══ */}
      <Box pos={[-W/2+0.32,0.45,-0.5]} size={[0.6,0.9,3.0]}   col="#f0ece8" rough={0.6} />
      <Box pos={[-W/2+0.02,0.9,-0.5]}  size={[0.65,0.05,3.0]} col="#d8d0c8" rough={0.2} metal={0.3} />
      <Box pos={[-W/2+0.22,2.1,-0.5]}  size={[0.4,0.7,3.0]}   col="#f0ece8" rough={0.6} />

      {/* ═══ SINK (center back) ═══ */}
      <Box pos={[0,0.91,-D/2+0.32]}   size={[1.1,0.06,0.55]}  col="#d5d5d5" rough={0.1} metal={0.7} />
      <Box pos={[0,0.78,-D/2+0.33]}   size={[0.85,0.18,0.42]} col="#c0c0c0" rough={0.1} metal={0.5} />
      <Cyl pos={[0,0.88,-D/2+0.25]}   r={0.02} h={0.25} col="#aaa" rough={0.1} metal={0.9} />

      {/* ═══ REFRIGERATOR (right corner) ═══ */}
      <Box pos={[W/2-0.38,-0.0,-D/2+0.42]} size={[0.65,1.85,0.7]}  col="#f0f0ee" rough={0.3} metal={0.4} />
      <Box pos={[W/2-0.38,1.15,-D/2+0.42]} size={[0.63,0.6,0.68]}  col="#ededed" rough={0.3} metal={0.4} />
      <Box pos={[W/2-0.35,0.6,-D/2+0.42]}  size={[0.02,0.95,0.04]} col="#aaa" rough={0.1} metal={0.9} />
      <Box pos={[W/2-0.35,1.35,-D/2+0.42]} size={[0.02,0.3,0.04]}  col="#aaa" rough={0.1} metal={0.9} />

      {/* ═══ KITCHEN ISLAND ═══ */}
      <Box pos={[0,0.9,0.2]}       size={[2.2,1.8,0.95]} col="#2a2218" rough={0.75} />
      <Box pos={[0,1.82,0.2]}      size={[2.4,0.06,1.1]} col="#e8ddd0" rough={0.1} metal={0.2} />
      {/* Stools */}
      {[-0.7,0,0.7].map((x,i)=>(
        <>
          <Cyl key={`s${i}`} pos={[x,0.5,1.1]} r={0.22} h={0.08} col="#1a1a1a" rough={0.7} />
          <Cyl key={`l${i}`} pos={[x,0.3,1.1]} r={0.03} h={0.6}  col="#555" rough={0.3} metal={0.8} />
          <Cyl key={`f${i}`} pos={[x,0.02,1.1]}r={0.18} h={0.04} col="#555" rough={0.3} metal={0.7} />
        </>
      ))}
      {/* Items on island */}
      <Box pos={[-0.6,1.9,0.2]}    size={[0.35,0.25,0.25]}  col="#c8a060" rough={0.4} metal={0.5} />
      <Cyl pos={[0.5,2.0,0.2]}     r={0.12} h={0.2} col="#e8d8c0" rough={0.6} />

      {/* ═══ OVERHEAD LIGHT (island) ═══ */}
      {[-0.65,0.65].map((x,i)=>(
        <>
          <Box key={`r${i}`} pos={[x,H-0.05,0.2]} size={[0.02,0.6,0.02]} col="#c8a060" rough={0.3} metal={0.8} />
          <Cyl key={`s${i}`} pos={[x,H-0.75,0.2]} r={0.12} h={0.2} col="#d4b870" rough={0.3} metal={0.5} />
          <pointLight key={`l${i}`} position={[x, H-0.85, 0.2]} intensity={0.7} color="#ffe0a0" distance={3} />
        </>
      ))}

      {/* Window above sink */}
      <Box pos={[0,1.95,-D/2+0.02]} size={[1.4,0.85,0.06]}  col="#c8e8f8" rough={0} metal={0.1} transparent opacity={0.4} />
      <Box pos={[0,1.95,-D/2+0.02]} size={[0.04,0.85,0.06]} col="#d4c8b0" rough={0.6} />
      <pointLight position={[0, 2.2, -D/2+1.0]} intensity={0.6} color="#fff5e8" distance={4} />
    </>
  );
}
