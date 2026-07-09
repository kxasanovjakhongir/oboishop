import { Box, Cyl, Sphere, Wall, Floor, RoomLights } from '../BaseRoom';
import { Environment } from '@react-three/drei';
import type { WallTextures } from '../../../types';

const W=8, H=3.2, D=7;

export default function LivingRoom({ t, scale=1, texRot=0 }: { t:WallTextures; scale?:number; texRot?:number }) {
  const p = { scale, texRot };
  return (
    <>
      <RoomLights />
      <Environment preset="apartment" />

      {/* Walls */}
      <Wall wallpaper={t.back}  pos={[0,H/2,-D/2]}    rot={[0,0,0]}          w={W} h={H} {...p} />
      <Wall wallpaper={t.left}  pos={[-W/2,H/2,0]}    rot={[0,Math.PI/2,0]}  w={D} h={H} {...p} />
      <Wall wallpaper={t.right} pos={[W/2,H/2,0]}     rot={[0,-Math.PI/2,0]} w={D} h={H} {...p} />
      <Wall wallpaper={t.front} pos={[0,H/2,D/2]}     rot={[0,Math.PI,0]}    w={W} h={H} {...p} />

      <Floor W={W} D={D} col="#5c4a38" />

      {/* Ceiling */}
      <Box pos={[0,H+0.01,0]} size={[W,0.05,D]} col="#f5f0eb" rough={1} metal={0} />

      {/* Baseboard */}
      <Box pos={[0,0.04,-D/2+0.02]} size={[W,0.08,0.04]} col="#c8bfb5" rough={0.9} />
      <Box pos={[-W/2+0.02,0.04,0]} size={[0.04,0.08,D]} col="#c8bfb5" rough={0.9} />
      <Box pos={[W/2-0.02,0.04,0]} size={[0.04,0.08,D]} col="#c8bfb5" rough={0.9} />

      {/* ═══ SOFA (dark blue-gray velvet) ═══ */}
      <Box pos={[0,0.28,-2.1]}     size={[3.2,0.48,1.0]}  col="#2a2d45" rough={0.95} />
      <Box pos={[0,0.72,-2.52]}    size={[3.2,0.52,0.14]} col="#2a2d45" rough={0.95} />
      <Box pos={[-1.68,0.52,-2.1]} size={[0.14,0.52,1.0]} col="#2a2d45" rough={0.95} />
      <Box pos={[1.68,0.52,-2.1]}  size={[0.14,0.52,1.0]} col="#2a2d45" rough={0.95} />
      {/* Sofa legs */}
      {[[-1.5,-1.5],[1.5,-1.5],[-1.5,-1.7],[1.5,-1.7]].map(([x,z],i)=>(
        <Cyl key={i} pos={[x as number, 0.05, z as number]} r={0.04} h={0.1} col="#888" metal={0.7} rough={0.3} />
      ))}
      {/* Cushions */}
      <Box pos={[-0.8,0.6,-2.25]}  size={[0.85,0.14,0.58]} col="#363a55" rough={0.95} />
      <Box pos={[0.8,0.6,-2.25]}   size={[0.85,0.14,0.58]} col="#363a55" rough={0.95} />
      <Box pos={[0,0.6,-2.25]}     size={[0.85,0.14,0.58]} col="#2f3249" rough={0.95} />
      {/* Throw pillows */}
      <Box pos={[-1.3,0.75,-2.22]} size={[0.38,0.32,0.22]} col="#e8b86d" rough={0.9} />
      <Box pos={[1.3,0.75,-2.22]}  size={[0.38,0.32,0.22]} col="#7c6fa0" rough={0.9} />

      {/* ═══ COFFEE TABLE (gold metal + glass) ═══ */}
      <Box pos={[0,0.38,-0.5]}     size={[1.35,0.04,0.72]} col="#c8a96e" rough={0.1} metal={0.8} transparent opacity={0.7} />
      <Box pos={[0,0.19,-0.5]}     size={[1.2,0.02,0.58]}  col="#c8a96e" rough={0.1} metal={0.8} transparent opacity={0.5} />
      {[[-0.58,-0.31],[0.58,-0.31],[-0.58,-0.69],[0.58,-0.69]].map(([x,z],i)=>(
        <Cyl key={i} pos={[x as number, 0.19, z as number]} r={0.025} h={0.38} col="#b89555" rough={0.2} metal={0.85} />
      ))}
      {/* Books on table */}
      <Box pos={[0.3,0.42,-0.52]}  size={[0.3,0.04,0.2]}   col="#c0392b" rough={0.8} />
      <Box pos={[0.3,0.46,-0.52]}  size={[0.3,0.04,0.2]}   col="#2980b9" rough={0.8} />
      {/* Vase */}
      <Cyl pos={[-0.3,0.5,-0.52]} r={0.07} h={0.25} col="#e8d5b0" rough={0.6} metal={0.1} />

      {/* ═══ FIREPLACE (back left wall) ═══ */}
      <Box pos={[-2.8,1.1,-D/2+0.08]} size={[1.8,2.0,0.16]} col="#8a7560" rough={0.9} />
      <Box pos={[-2.8,0.7,-D/2+0.12]} size={[1.05,1.0,0.18]} col="#111" rough={0.95} />
      <Box pos={[-2.8,2.2,-D/2+0.1]}  size={[2.1,0.13,0.45]} col="#9a8570" rough={0.85} />
      {/* Fire glow */}
      <Box pos={[-2.8,0.3,-D/2+0.15]} size={[0.6,0.35,0.05]} col="#ff5722" emit="#ff6600" emitIntensity={2} />
      <Box pos={[-2.8,0.55,-D/2+0.15]} size={[0.4,0.2,0.04]} col="#ffcc00" emit="#ffaa00" emitIntensity={1.5} />
      {/* Fireplace point light */}
      <pointLight position={[-2.8, 0.8, -D/2+0.5]} intensity={1.2} color="#ff8833" distance={4} />
      {/* Mantle decor */}
      <Cyl pos={[-3.3,2.34,-D/2+0.25]} r={0.04} h={0.28} col="#ddd" rough={0.3} />
      <Cyl pos={[-2.3,2.34,-D/2+0.25]} r={0.04} h={0.28} col="#ddd" rough={0.3} />
      <Box pos={[-2.8,2.36,-D/2+0.22]} size={[0.45,0.22,0.22]} col="#c8b090" rough={0.5} />

      {/* ═══ TV WALL UNIT (right wall) ═══ */}
      <Box pos={[W/2-0.22,0.45,0]}  size={[0.25,0.9,2.8]}    col="#1a1a1a" rough={0.7} />
      <Box pos={[W/2-0.22,0.9,0]}   size={[0.25,0.05,2.8]}   col="#222" rough={0.6} />
      <Box pos={[W/2-0.16,1.45,0]}  size={[0.07,0.95,1.75]}  col="#0a0a0a" rough={0.2} metal={0.3} />
      {/* TV screen */}
      <Box pos={[W/2-0.12,1.45,0]}  size={[0.02,0.82,1.6]}   col="#0d1b2a" emit="#1a3a6a" emitIntensity={0.3} />

      {/* ═══ BOOKSHELF (near back right) ═══ */}
      <Box pos={[2.6,1.0,-D/2+0.2]}  size={[1.4,2.0,0.32]}  col="#3a2e22" rough={0.8} />
      <Box pos={[2.6,0.5,-D/2+0.2]}  size={[1.3,0.04,0.28]} col="#4a3c2e" rough={0.8} />
      <Box pos={[2.6,1.1,-D/2+0.2]}  size={[1.3,0.04,0.28]} col="#4a3c2e" rough={0.8} />
      <Box pos={[2.6,1.7,-D/2+0.2]}  size={[1.3,0.04,0.28]} col="#4a3c2e" rough={0.8} />
      {/* Books */}
      {[['#c0392b',0.15],['#2980b9',0.2],['#27ae60',0.18],['#f39c12',0.15],['#8e44ad',0.22]].map(([c,w],i)=>(
        <Box key={i} pos={[1.95+i*0.22, 0.78, -D/2+0.17]} size={[w as number,0.28,0.24]} col={c as string} rough={0.9} />
      ))}
      {[['#e74c3c',0.18],['#3498db',0.16],['#2ecc71',0.2],['#e67e22',0.15]].map(([c,w],i)=>(
        <Box key={i} pos={[2.0+i*0.24, 1.38, -D/2+0.17]} size={[w as number,0.28,0.24]} col={c as string} rough={0.9} />
      ))}

      {/* ═══ FLOOR LAMP ═══ */}
      <Box pos={[-1.85,0.03,-2.55]}  size={[0.28,0.06,0.28]} col="#6a6060" rough={0.5} metal={0.5} />
      <Cyl pos={[-1.85,1.0,-2.55]} r={0.025} h={1.9} col="#aaa" rough={0.3} metal={0.8} />
      <Cyl pos={[-1.85,2.1,-2.55]} r={0.22} h={0.38} col="#f0e0b0" rough={0.6} />
      <pointLight position={[-1.85, 1.9, -2.55]} intensity={0.8} color="#ffe8aa" distance={3} />

      {/* ═══ PENDANT LIGHT ═══ */}
      <Box pos={[0,H-0.05,-1.5]} size={[0.02,0.5,0.02]} col="#888" rough={0.4} metal={0.8} />
      <Cyl pos={[0,H-0.7,-1.5]} r={0.3} h={0.22} col="#e8d070" rough={0.5} metal={0.2} />
      <pointLight position={[0, H-0.85, -1.5]} intensity={1.0} color="#ffe0aa" distance={5} />

      {/* ═══ PLANT (corner) ═══ */}
      <Cyl pos={[-3.3,0.3,2.0]}  r={0.22} h={0.5}  col="#6a4f38" rough={0.9} />
      <Sphere pos={[-3.3,0.85,2.0]} r={0.45} col="#2d6626" rough={1.0} />
      <Sphere pos={[-3.0,0.7,1.8]}  r={0.25} col="#266620" rough={1.0} />
      <Sphere pos={[-3.5,0.75,2.2]} r={0.22} col="#2a7030" rough={1.0} />

      {/* ═══ RUG ═══ */}
      <Box pos={[0,0.005,-1.0]} size={[4.5,0.015,2.5]} col="#8b6f5c" rough={1.0} />
      <Box pos={[0,0.006,-1.0]} size={[4.1,0.008,2.1]} col="#a07d62" rough={1.0} />

      {/* Windows on right wall */}
      <Box pos={[W/2-0.02,1.8,-1.0]} size={[0.06,1.4,1.8]} col="#d4c8b5" rough={0.6} />
      <Box pos={[W/2-0.02,1.8,-1.0]} size={[0.04,0.05,1.8]} col="#d4c8b5" rough={0.6} />
      <Box pos={[W/2-0.01,1.8,-1.0]} size={[0.02,1.3,1.7]}  col="#c8e8f8" rough={0} metal={0.1} transparent opacity={0.3} />
      <pointLight position={[W/2-0.5, 2.0, -1.0]} intensity={0.8} color="#fff5e0" distance={5} />
    </>
  );
}
