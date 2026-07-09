import { Box, Cyl, Sphere, Wall, Floor, RoomLights } from '../BaseRoom';
import { Environment } from '@react-three/drei';
import type { WallTextures } from '../../../types';

const W=5, H=2.7, D=5;

export default function KidsRoom({ t, scale=1, texRot=0 }: { t:WallTextures; scale?:number; texRot?:number }) {
  const p={scale,texRot};
  return (
    <>
      <RoomLights warm />
      <Environment preset="apartment" />

      <Wall wallpaper={t.back}  pos={[0,H/2,-D/2]}   rot={[0,0,0]}         w={W} h={H} {...p} />
      <Wall wallpaper={t.left}  pos={[-W/2,H/2,0]}   rot={[0,Math.PI/2,0]} w={D} h={H} {...p} />
      <Wall wallpaper={t.right} pos={[W/2,H/2,0]}    rot={[0,-Math.PI/2,0]}w={D} h={H} {...p} />
      <Wall wallpaper={t.front} pos={[0,H/2,D/2]}    rot={[0,Math.PI,0]}   w={W} h={H} {...p} />
      <Floor W={W} D={D} col="#c8b090" />
      <Box pos={[0,H+0.01,0]} size={[W,0.05,D]} col="#fff" rough={1} metal={0} />

      {/* ═══ CHILD BED ═══ */}
      <Box pos={[-1.2,0.22,-1.8]}   size={[1.4,0.38,2.0]}  col="#e8eeff" rough={0.8} />
      <Box pos={[-1.2,0.9,-2.45]}   size={[1.4,1.1,0.1]}   col="#7fb3ff" rough={0.7} />
      <Box pos={[-1.2,0.42,-2.4]}   size={[1.4,0.08,0.1]}  col="#a0c8ff" rough={0.7} />
      {/* Footboard */}
      <Box pos={[-1.2,0.6,-0.8]}    size={[1.4,0.55,0.1]}  col="#7fb3ff" rough={0.7} />
      {/* Mattress */}
      <Box pos={[-1.2,0.45,-1.8]}   size={[1.25,0.18,1.85]} col="#fff" rough={0.9} />
      {/* Bedding */}
      <Box pos={[-1.2,0.58,-1.7]}   size={[1.2,0.06,1.6]}  col="#ffcc88" rough={0.95} />
      {/* Pillow */}
      <Box pos={[-1.2,0.65,-2.3]}   size={[0.9,0.15,0.4]}  col="#fff" rough={0.9} />
      <Box pos={[-0.6,0.7,-2.25]}   size={[0.4,0.28,0.3]}  col="#ff88aa" rough={0.9} />
      {/* Stuffed toy */}
      <Sphere pos={[-1.5,0.65,-2.0]} r={0.14} col="#ffaa44" rough={0.9} />

      {/* ═══ TOY SHELF ═══ */}
      <Box pos={[1.8,1.0,-2.2]}     size={[1.1,2.0,0.3]}   col="#f5e8d0" rough={0.75} />
      {[0.3,0.75,1.2,1.65].map((y,i)=>(
        <Box key={i} pos={[1.8,y,-2.2]} size={[1.0,0.04,0.28]} col="#e8d8c0" rough={0.75} />
      ))}
      {/* Toys on shelf */}
      <Sphere pos={[1.5,0.5,-2.15]}  r={0.12} col="#ff4444" rough={0.8} />
      <Box    pos={[1.8,0.5,-2.15]}  size={[0.18,0.22,0.18]} col="#4488ff" rough={0.7} />
      <Cyl    pos={[2.1,0.52,-2.15]} r={0.09} h={0.22} col="#44cc44" rough={0.7} />
      <Box    pos={[1.5,0.96,-2.15]} size={[0.22,0.18,0.18]} col="#ffaa00" rough={0.7} />
      <Sphere pos={[1.9,1.0,-2.15]}  r={0.1}  col="#aa44ff" rough={0.8} />
      <Box    pos={[2.2,0.98,-2.15]} size={[0.16,0.2,0.16]}  col="#ff6644" rough={0.7} />
      {/* Books */}
      {[['#e74c3c',0.12],['#3498db',0.1],['#27ae60',0.11],['#f39c12',0.1]].map(([c,w],i)=>(
        <Box key={i} pos={[1.45+i*0.17,1.47,-2.14]} size={[w as number,0.26,0.22]} col={c as string} rough={0.9} />
      ))}

      {/* ═══ SMALL DESK ═══ */}
      <Box pos={[1.5,0.55,1.0]}     size={[1.2,0.05,0.65]}  col="#f5e8d0" rough={0.7} />
      {/* Desk legs */}
      {[0.5,0.5,-0.5,-0.5].map((x,i)=>(
        <Box key={i} pos={[1.0+(i%2)*1.0,0.28,0.7+(i>1?0.6:0)]} size={[0.04,0.55,0.04]} col="#e0d0b8" rough={0.7} />
      ))}
      {/* Chair */}
      <Box pos={[1.5,0.38,1.7]}     size={[0.55,0.06,0.5]}  col="#88aaff" rough={0.8} />
      <Box pos={[1.5,0.66,1.45]}    size={[0.55,0.5,0.06]}  col="#88aaff" rough={0.8} />
      <Cyl pos={[1.5,0.22,1.7]}     r={0.04} h={0.44} col="#555" rough={0.4} metal={0.7} />
      <Cyl pos={[1.5,0.04,1.7]}     r={0.18} h={0.04} col="#555" rough={0.4} metal={0.7} />
      {/* Desk items */}
      <Box pos={[1.3,0.6,0.95]}     size={[0.32,0.22,0.25]} col="#88ccff" rough={0.3} metal={0.3} />
      <Cyl pos={[1.8,0.65,1.0]}     r={0.04} h={0.2}  col="#ff6666" rough={0.7} />

      {/* ═══ COLORFUL WALL DECORATIONS ═══ */}
      {[[-0.8,2.0],[-0.2,1.9],[0.4,2.1],[1.0,1.85]].map(([x,y],i)=>{
        const cols=['#ff6b6b','#4ecdc4','#ffe66d','#a8e6cf'];
        return <Box key={i} pos={[x as number,y as number,-D/2+0.02]} size={[0.28,0.35,0.02]} col={cols[i]} rough={0.7} />;
      })}

      {/* ═══ WINDOW ═══ */}
      <Box pos={[W/2-0.02,1.6,0.3]} size={[0.05,1.1,1.2]}   col="#d0c8b8" rough={0.6} />
      <Box pos={[W/2-0.01,1.6,0.3]} size={[0.02,1.0,1.1]}   col="#c8e8f8" rough={0} metal={0.1} transparent opacity={0.4} />
      <pointLight position={[W/2-0.5,2.0,0.3]} intensity={0.8} color="#fff5e8" distance={4} />

      {/* ═══ NIGHT LIGHT ═══ */}
      <Box pos={[-1.85,0.05,0.5]} size={[0.25,0.05,0.25]}    col="#f5e8d0" rough={0.7} />
      <Cyl pos={[-1.85,0.5,0.5]}  r={0.04} h={0.9}           col="#bbb" rough={0.3} metal={0.7} />
      <Sphere pos={[-1.85,1.05,0.5]} r={0.15}                 col="#ffee88" emit="#ffdd44" emitIntensity={1.0} />
      <pointLight position={[-1.85,1.0,0.5]} intensity={0.6} color="#ffee88" distance={2.5} />

      {/* ═══ CEILING LIGHT ═══ */}
      <Box pos={[0,H-0.02,0]} size={[0.3,0.04,0.3]} col="#fffae0" emit="#fffae0" emitIntensity={1.0} />
      <pointLight position={[0,H-0.1,0]} intensity={1.2} color="#fff8e8" distance={6} />

      {/* ═══ RUG ═══ */}
      <Box pos={[0,0.005,-0.5]} size={[3.5,0.015,2.5]} col="#ffcc66" rough={1.0} />
      <Box pos={[0,0.006,-0.5]} size={[3.0,0.008,2.0]} col="#ff9944" rough={1.0} />
    </>
  );
}
