import { Box, Cyl, Wall, Floor, RoomLights } from '../BaseRoom';
import { Environment } from '@react-three/drei';
import type { WallTextures } from '../../../types';

const W=6.5, H=2.9, D=5.5;

export default function Bedroom({ t, scale=1, texRot=0 }: { t:WallTextures; scale?:number; texRot?:number }) {
  const p={scale,texRot};
  return (
    <>
      <RoomLights warm />
      <Environment preset="apartment" />

      <Wall wallpaper={t.back}  pos={[0,H/2,-D/2]}   rot={[0,0,0]}         w={W} h={H} {...p} />
      <Wall wallpaper={t.left}  pos={[-W/2,H/2,0]}   rot={[0,Math.PI/2,0]} w={D} h={H} {...p} />
      <Wall wallpaper={t.right} pos={[W/2,H/2,0]}    rot={[0,-Math.PI/2,0]}w={D} h={H} {...p} />
      <Wall wallpaper={t.front} pos={[0,H/2,D/2]}    rot={[0,Math.PI,0]}   w={W} h={H} {...p} />
      <Floor W={W} D={D} col="#7a5c40" />
      <Box pos={[0,H+0.01,0]} size={[W,0.05,D]} col="#f5f0ea" rough={1} metal={0} />

      {/* ═══ BED ═══ */}
      {/* Frame */}
      <Box pos={[0,0.22,-1.5]}      size={[2.0,0.38,2.1]}  col="#3a2e22" rough={0.8} />
      {/* Headboard */}
      <Box pos={[0,0.85,-2.5]}      size={[2.0,1.1,0.12]}  col="#3a2e22" rough={0.75} />
      {/* Mattress */}
      <Box pos={[0,0.45,-1.5]}      size={[1.8,0.22,2.0]}  col="#f5f0ea" rough={0.9} />
      {/* Bedding */}
      <Box pos={[0,0.6,-1.3]}       size={[1.75,0.08,1.7]} col="#d4c8ba" rough={0.95} />
      <Box pos={[0,0.63,-1.2]}      size={[1.7,0.06,1.5]}  col="#e8e0d5" rough={0.95} />
      {/* Pillows */}
      <Box pos={[-0.45,0.72,-2.35]} size={[0.7,0.18,0.45]} col="#fff" rough={0.9} />
      <Box pos={[0.45,0.72,-2.35]}  size={[0.7,0.18,0.45]} col="#fff" rough={0.9} />
      <Box pos={[-0.45,0.82,-2.2]}  size={[0.55,0.22,0.38]} col="#e8d5c0" rough={0.9} />
      <Box pos={[0.45,0.82,-2.2]}   size={[0.55,0.22,0.38]} col="#ddd" rough={0.9} />
      {/* Throw blanket */}
      <Box pos={[0,0.66,-0.4]}      size={[1.6,0.06,0.8]}  col="#7a5a8a" rough={0.95} />
      {/* Bed legs */}
      {[[-0.9,-0.5],[0.9,-0.5],[-0.9,-2.5],[0.9,-2.5]].map(([x,z],i)=>(
        <Box key={i} pos={[x as number,0.05,z as number]} size={[0.08,0.08,0.08]} col="#2a2015" rough={0.8} />
      ))}

      {/* ═══ NIGHTSTANDS ═══ */}
      {[[-1.35,1],[1.35,1]].map(([x,s],i)=>(
        <Box key={i} pos={[x as number,0.38,-2.15]} size={[0.5,0.6,0.45]} col="#4a3c2e" rough={0.8} />
      ))}
      {/* Lamps on nightstands */}
      {[[-1.35,1],[1.35,1]].map(([x],i)=>(
        <>
          <Cyl key={`b${i}`} pos={[x as number,0.75,-2.15]} r={0.06} h={0.38} col="#aaa" rough={0.3} metal={0.8} />
          <Cyl key={`s${i}`} pos={[x as number,1.0,-2.15]}  r={0.14} h={0.22} col="#f5e8c0" rough={0.5} />
          <pointLight key={`l${i}`} position={[x as number,0.9,-2.15]} intensity={0.5} color="#ffe8aa" distance={2} />
        </>
      ))}

      {/* ═══ WARDROBE (left wall) ═══ */}
      <Box pos={[-W/2+0.25,1.2,-0.8]} size={[0.38,2.4,1.8]}   col="#3a2e22" rough={0.7} />
      <Box pos={[-W/2+0.26,1.2,-0.8]} size={[0.04,2.35,0.88]} col="#4a3c2e" rough={0.7} />
      <Box pos={[-W/2+0.26,1.2,-1.71]}size={[0.04,2.35,0.88]} col="#4a3c2e" rough={0.7} />
      {/* Handles */}
      <Box pos={[-W/2+0.29,1.3,-0.35]}size={[0.03,0.12,0.02]} col="#c8a060" rough={0.2} metal={0.8} />
      <Box pos={[-W/2+0.29,1.3,-1.25]}size={[0.03,0.12,0.02]} col="#c8a060" rough={0.2} metal={0.8} />
      <Box pos={[-W/2+0.29,1.3,-2.15]}size={[0.03,0.12,0.02]} col="#c8a060" rough={0.2} metal={0.8} />

      {/* ═══ MIRROR/VANITY (right wall) ═══ */}
      <Box pos={[W/2-0.25,1.1,0.8]}  size={[0.18,1.1,0.75]}   col="#3a2e22" rough={0.8} />
      <Box pos={[W/2-0.22,1.4,0.8]}  size={[0.04,0.85,0.65]}  col="#a8c8d8" rough={0} metal={0.2} transparent opacity={0.5} />
      {/* Vanity items */}
      <Cyl pos={[W/2-0.35,0.72,0.65]} r={0.05} h={0.2}  col="#d4a0a0" rough={0.4} metal={0.2} />
      <Cyl pos={[W/2-0.35,0.72,0.95]} r={0.04} h={0.16} col="#c0a0d0" rough={0.4} />

      {/* ═══ RUG ═══ */}
      <Box pos={[0,0.005,-1.5]} size={[2.5,0.015,3.0]} col="#9a8070" rough={1.0} />
      <Box pos={[0,0.006,-1.5]} size={[2.2,0.008,2.6]} col="#b09080" rough={1.0} />

      {/* ═══ WINDOW + CURTAINS ═══ */}
      <Box pos={[W/2-0.02,1.7,0.3]}  size={[0.05,1.3,1.4]}   col="#d4c8b0" rough={0.6} />
      <Box pos={[W/2-0.01,1.7,0.3]}  size={[0.02,1.15,1.3]}  col="#c8e8f8" rough={0} metal={0.1} transparent opacity={0.35} />
      {/* Curtain rod */}
      <Cyl pos={[W/2-0.12,2.4,0.3]} r={0.02} h={2.2} col="#c8a060" rough={0.3} metal={0.7} rot={[0,0,Math.PI/2]} />
      {/* Curtains */}
      <Box pos={[W/2-0.12,1.45,-0.55]} size={[0.06,1.9,0.12]} col="#c8b8a0" rough={0.9} />
      <Box pos={[W/2-0.12,1.45,1.15]}  size={[0.06,1.9,0.12]} col="#c8b8a0" rough={0.9} />

      {/* ═══ PENDANT LIGHT ═══ */}
      <Box pos={[0,H-0.05,0]} size={[0.02,0.4,0.02]} col="#888" rough={0.4} metal={0.8} />
      <Cyl pos={[0,H-0.6,0]} r={0.28} h={0.2} col="#f0e8d0" rough={0.5} />
      <pointLight position={[0, H-0.7, 0]} intensity={1.0} color="#ffe4aa" distance={5} />
    </>
  );
}
