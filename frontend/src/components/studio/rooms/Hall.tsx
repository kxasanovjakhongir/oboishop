import { Box, Cyl, Sphere, Wall, Floor, RoomLights } from '../BaseRoom';
import { Environment } from '@react-three/drei';
import type { WallTextures } from '../../../types';

const W=3.5, H=3, D=8;

export default function Hall({ t, scale=1, texRot=0 }: { t:WallTextures; scale?:number; texRot?:number }) {
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
      <Box pos={[0,H+0.01,0]} size={[W,0.05,D]} col="#f8f5f0" rough={1} metal={0} />

      {/* Floor tiles pattern (lighter strip) */}
      {[-2.5,-1.5,-0.5,0.5,1.5,2.5].map((z,i)=>(
        <Box key={i} pos={[0,0.002,z]} size={[W-0.2,0.003,0.85]} col="#f0ece5" rough={0.15} metal={0.2} />
      ))}

      {/* ═══ CONSOLE TABLE ═══ */}
      <Box pos={[0,0.78,-3.0]}     size={[1.8,0.05,0.45]}  col="#2a2015" rough={0.75} />
      {/* Legs */}
      {[[-0.8,-0.8],[0.8,-0.8],[-0.8,-3.2],[0.8,-3.2]].map(([x,z],i)=>(
        <Box key={i} pos={[x as number, 0.39, z as number]} size={[0.05,0.78,0.05]} col="#2a2015" rough={0.7} />
      ))}
      {/* Console shelf */}
      <Box pos={[0,0.45,-3.0]}     size={[1.7,0.04,0.4]}   col="#3a3025" rough={0.7} />
      {/* Items on console */}
      <Box pos={[-0.5,0.83,-3.0]}  size={[0.22,0.35,0.18]} col="#c8a060" rough={0.2} metal={0.5} />
      <Cyl pos={[0.5,0.95,-3.0]}   r={0.1} h={0.32} col="#e8d5b0" rough={0.5} />
      <Box pos={[0,0.88,-3.05]}    size={[0.15,0.2,0.15]}  col="#4a6a8a" rough={0.5} />
      {/* Decorative lamp */}
      <Cyl pos={[0.7,0.83,-3.0]}   r={0.04} h={0.25} col="#aaa" rough={0.2} metal={0.9} />
      <Cyl pos={[0.7,1.0,-3.0]}    r={0.12} h={0.18} col="#f5e8d0" rough={0.4} />
      <pointLight position={[0.7, 0.95, -3.0]} intensity={0.4} color="#ffe8aa" distance={2} />

      {/* ═══ LARGE MIRROR ═══ */}
      <Box pos={[0,1.6,-3.5]}     size={[1.2,1.6,0.05]}   col="#2a2015" rough={0.7} />
      <Box pos={[0,1.6,-3.47]}    size={[1.1,1.5,0.02]}   col="#b8d0d8" rough={0} metal={0.3} transparent opacity={0.7} />
      {/* Mirror frame detail */}
      <Box pos={[0,1.6,-3.53]}    size={[1.3,0.04,0.06]}  col="#3a3025" rough={0.7} />
      <Box pos={[0,2.41,-3.53]}   size={[1.3,0.04,0.06]}  col="#3a3025" rough={0.7} />

      {/* ═══ COAT RACK ═══ */}
      <Cyl pos={[-1.2,1.0,2.0]}   r={0.04} h={2.0} col="#3a2e22" rough={0.8} />
      <Box pos={[-1.2,2.1,2.0]}   size={[0.06,0.06,0.9]} col="#3a2e22" rough={0.7} />
      <Box pos={[-1.2,1.6,2.0]}   size={[0.06,0.06,0.7]} col="#3a2e22" rough={0.7} />
      {/* Hooks */}
      {[[-0.38,0.38]].flatMap(([z1,z2])=>[-0.2,0.2].map((z,i)=>(
        <Cyl key={i} pos={[-1.18,2.1+i*0.05,z]} r={0.02} h={0.18} col="#888" rough={0.3} metal={0.8} rot={[Math.PI/2,0,Math.PI/2]} />
      )))}
      {/* Hanging coat (simplified) */}
      <Box pos={[-1.05,1.65,2.1]} size={[0.04,0.55,0.25]}  col="#2d4060" rough={0.9} />
      <Box pos={[-1.05,1.5,2.1]}  size={[0.04,0.25,0.38]}  col="#3a5070" rough={0.9} />

      {/* ═══ WALL SCONCES ═══ */}
      {[-1.5,1.5].map((z,i)=>(
        <>
          <Box key={`b${i}`} pos={[-W/2+0.08,2.2,z]} size={[0.12,0.04,0.08]} col="#c8a060" rough={0.3} metal={0.7} />
          <Cyl key={`s${i}`} pos={[-W/2+0.12,2.2,z]} r={0.1}  h={0.18} col="#f5e8d0" rough={0.4} rot={[0,0,Math.PI/2]} />
          <pointLight key={`l${i}`} position={[-W/2+0.4, 2.2, z]} intensity={0.5} color="#ffe8aa" distance={2.5} />
          <Box key={`b2${i}`} pos={[W/2-0.08,2.2,z]}  size={[0.12,0.04,0.08]} col="#c8a060" rough={0.3} metal={0.7} />
          <Cyl key={`s2${i}`} pos={[W/2-0.12,2.2,z]}  r={0.1}  h={0.18} col="#f5e8d0" rough={0.4} rot={[0,0,Math.PI/2]} />
          <pointLight key={`l2${i}`} position={[W/2-0.4, 2.2, z]} intensity={0.5} color="#ffe8aa" distance={2.5} />
        </>
      ))}

      {/* ═══ DOOR (front wall) ═══ */}
      <Box pos={[0.5,1.05,D/2-0.02]} size={[0.95,2.0,0.06]}  col="#3a2e22" rough={0.7} />
      <Box pos={[0.5,1.05,D/2-0.01]} size={[0.88,1.92,0.02]} col="#4a3c2e" rough={0.6} />
      <Sphere pos={[0.05,1.05,D/2-0.04]} r={0.045}           col="#c8a060" rough={0.1} metal={0.9} />
      {/* Door frame */}
      <Box pos={[0.5,2.05,D/2-0.0]}  size={[1.05,0.1,0.08]}  col="#c8c0b5" rough={0.7} />
      <Box pos={[-0.0,1.05,D/2-0.0]} size={[0.1,2.0,0.08]}   col="#c8c0b5" rough={0.7} />
      <Box pos={[1.0,1.05,D/2-0.0]}  size={[0.1,2.0,0.08]}   col="#c8c0b5" rough={0.7} />

      {/* ═══ OVERHEAD CEILING LIGHTS ═══ */}
      {[-2,0,2].map((z,i)=>(
        <>
          <Box key={`f${i}`} pos={[0,H-0.02,z]} size={[0.22,0.04,0.22]} col="#fffae0" emit="#fffae0" emitIntensity={0.8} />
          <pointLight key={`l${i}`} position={[0,H-0.1,z]} intensity={0.8} color="#fffae8" distance={4} />
        </>
      ))}

      {/* Baseboard */}
      <Box pos={[0,0.04,-D/2+0.02]} size={[W,0.08,0.04]} col="#e8e0d5" rough={0.7} />
      <Box pos={[-W/2+0.02,0.04,0]} size={[0.04,0.08,D]} col="#e8e0d5" rough={0.7} />
      <Box pos={[W/2-0.02,0.04,0]}  size={[0.04,0.08,D]} col="#e8e0d5" rough={0.7} />
    </>
  );
}
