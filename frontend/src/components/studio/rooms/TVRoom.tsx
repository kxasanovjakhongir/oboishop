import { Box, Cyl, Wall, Floor, RoomLights } from '../BaseRoom';
import { Environment } from '@react-three/drei';
import type { WallTextures } from '../../../types';

const W=7.5, H=3.1, D=6.5;

export default function TVRoom({ t, scale=1, texRot=0 }: { t:WallTextures; scale?:number; texRot?:number }) {
  const p={scale,texRot};
  return (
    <>
      <hemisphereLight color="#c8d4ff" groundColor="#0a0a12" intensity={0.35} />
      <directionalLight position={[3,6,4]} intensity={1.4} castShadow color="#fff8f5"
        shadow-mapSize={[2048,2048]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8}
        shadow-bias={-0.0004} shadow-radius={4} />
      <pointLight position={[0,3,0]} intensity={0.4} color="#c8c8ff" />
      <Environment preset="night" />

      <Wall wallpaper={t.back}  pos={[0,H/2,-D/2]}   rot={[0,0,0]}         w={W} h={H} {...p} />
      <Wall wallpaper={t.left}  pos={[-W/2,H/2,0]}   rot={[0,Math.PI/2,0]} w={D} h={H} {...p} />
      <Wall wallpaper={t.right} pos={[W/2,H/2,0]}    rot={[0,-Math.PI/2,0]}w={D} h={H} {...p} />
      <Wall wallpaper={t.front} pos={[0,H/2,D/2]}    rot={[0,Math.PI,0]}   w={W} h={H} {...p} />
      <Floor W={W} D={D} col="#2a2a2a" />
      <Box pos={[0,H+0.01,0]} size={[W,0.05,D]} col="#111" rough={1} metal={0} />

      {/* Ceiling cove light strip */}
      <Box pos={[0,H-0.08,0]} size={[W-0.2,0.04,D-0.2]} col="#111" rough={0.5} />
      <Box pos={[0,H-0.06,-D/2+0.15]} size={[W-0.2,0.02,0.04]} col="#6688ff" emit="#4466ee" emitIntensity={1.5} />
      <Box pos={[0,H-0.06,D/2-0.15]}  size={[W-0.2,0.02,0.04]} col="#6688ff" emit="#4466ee" emitIntensity={1.5} />
      <Box pos={[-W/2+0.15,H-0.06,0]} size={[0.04,0.02,D-0.2]} col="#6688ff" emit="#4466ee" emitIntensity={1.5} />
      <Box pos={[W/2-0.15,H-0.06,0]}  size={[0.04,0.02,D-0.2]} col="#6688ff" emit="#4466ee" emitIntensity={1.5} />

      {/* ═══ LARGE TV WALL UNIT (back wall) ═══ */}
      {/* TV Wall Panel */}
      <Box pos={[0,H/2,-D/2+0.04]}  size={[W-0.4,H,0.08]}    col="#0a0a0a" rough={0.8} />
      {/* TV */}
      <Box pos={[0,1.7,-D/2+0.18]}  size={[3.8,2.0,0.08]}     col="#0d0d0d" rough={0.1} metal={0.4} />
      {/* TV Screen (glowing) */}
      <Box pos={[0,1.7,-D/2+0.16]}  size={[3.6,1.85,0.02]}    col="#0a1a3a" emit="#1a3a7a" emitIntensity={0.8} />
      <pointLight position={[0,1.7,-D/2+0.8]} intensity={0.6} color="#3355aa" distance={4} />
      {/* TV Stand */}
      <Box pos={[0,0.04,-D/2+0.18]} size={[0.35,0.08,0.25]}   col="#111" rough={0.2} metal={0.5} />
      <Box pos={[-0.15,0.08,-D/2+0.2]} size={[0.04,0.12,0.04]} col="#111" rough={0.2} metal={0.5} />
      <Box pos={[0.15,0.08,-D/2+0.2]}  size={[0.04,0.12,0.04]} col="#111" rough={0.2} metal={0.5} />
      {/* Soundbar */}
      <Box pos={[0,0.6,-D/2+0.18]}  size={[2.5,0.12,0.1]}     col="#0a0a0a" rough={0.3} metal={0.5} />
      {/* Media unit */}
      <Box pos={[0,0.3,-D/2+0.22]}  size={[3.2,0.5,0.35]}     col="#111" rough={0.5} />
      <Box pos={[-0.85,0.3,-D/2+0.22]} size={[1.4,0.46,0.32]} col="#0d0d0d" rough={0.4} />
      <Box pos={[0.85,0.3,-D/2+0.22]}  size={[1.4,0.46,0.32]} col="#0d0d0d" rough={0.4} />
      {/* Console devices */}
      <Box pos={[-0.5,0.57,-D/2+0.22]} size={[0.5,0.06,0.28]} col="#111" rough={0.2} metal={0.6} />
      <Box pos={[0.5,0.57,-D/2+0.22]}  size={[0.4,0.04,0.2]}  col="#1a1a1a" rough={0.2} metal={0.5} />

      {/* ═══ L-SHAPED SOFA ═══ */}
      {/* Main section (facing TV) */}
      <Box pos={[0,0.38,-0.5]}      size={[4.0,0.45,1.2]}   col="#1c1c2a" rough={0.9} />
      <Box pos={[0,0.75,-0.98]}     size={[4.0,0.55,0.14]}  col="#1c1c2a" rough={0.9} />
      <Box pos={[-2.07,0.6,-0.5]}   size={[0.14,0.55,1.2]}  col="#1c1c2a" rough={0.9} />
      <Box pos={[2.07,0.6,-0.5]}    size={[0.14,0.55,1.2]}  col="#1c1c2a" rough={0.9} />
      {/* Side extension (L-shape) */}
      <Box pos={[-1.72,0.38,0.5]}   size={[2.5,0.45,1.2]}   col="#1c1c2a" rough={0.9} />
      <Box pos={[-2.8,0.75,0.5]}    size={[0.5,0.55,1.2]}   col="#1c1c2a" rough={0.9} />
      <Box pos={[-1.72,0.75,0.98]}  size={[2.5,0.55,0.14]}  col="#1c1c2a" rough={0.9} />
      {/* Cushions */}
      {[-1.2,-0.4,0.4,1.2].map((x,i)=>(
        <Box key={i} pos={[x,0.65,-0.65]} size={[0.7,0.14,0.65]} col="#252535" rough={0.95} />
      ))}
      {/* Throw pillows */}
      <Box pos={[-1.8,0.75,-0.68]}  size={[0.38,0.32,0.22]} col="#4455aa" rough={0.9} />
      <Box pos={[1.8,0.75,-0.68]}   size={[0.38,0.32,0.22]} col="#aa4455" rough={0.9} />

      {/* ═══ OTTOMAN ═══ */}
      <Box pos={[0.5,0.32,0.8]}     size={[1.0,0.38,0.7]}   col="#2a2a3a" rough={0.85} />
      <Box pos={[0.5,0.52,0.8]}     size={[0.9,0.06,0.6]}   col="#333345" rough={0.9} />

      {/* ═══ SIDE TABLES ═══ */}
      {[[-2.3,-0.2],[2.3,-0.2]].map(([x,z],i)=>(
        <>
          <Box key={`t${i}`} pos={[x as number,0.6,z as number]} size={[0.5,0.05,0.5]}     col="#222" rough={0.2} metal={0.6} />
          <Cyl key={`l${i}`} pos={[x as number,0.3,z as number]} r={0.04} h={0.6}          col="#888" rough={0.3} metal={0.8} />
          <Box key={`b${i}`} pos={[x as number,0.04,z as number]} size={[0.38,0.06,0.38]}  col="#333" rough={0.2} metal={0.5} />
          {/* Item on table */}
          <Cyl key={`d${i}`} pos={[x as number,0.68,z as number]} r={0.06} h={0.18}        col="#c8c8cc" rough={0.1} metal={0.8} />
        </>
      ))}

      {/* ═══ ACOUSTIC PANELS ═══ */}
      {[[-2.8,1.5],[-1.4,1.5],[1.4,1.5],[2.8,1.5]].map(([x,y],i)=>{
        const cols=['#1a1a3a','#1a3a1a','#3a1a1a','#2a2a1a'];
        return <Box key={i} pos={[x as number,y as number,-D/2+0.08]} size={[1.1,0.9,0.08]} col={cols[i]} rough={1.0} />;
      })}

      {/* ═══ FLOOR LAMPS ═══ */}
      {[[-3.2,2.0],[3.2,2.0]].map(([x,z],i)=>(
        <>
          <Box key={`b${i}`} pos={[x as number,0.03,z as number]} size={[0.22,0.06,0.22]} col="#333" rough={0.3} metal={0.7} />
          <Cyl key={`p${i}`} pos={[x as number,1.1,z as number]}  r={0.025} h={2.1}      col="#555" rough={0.3} metal={0.8} />
          <Cyl key={`s${i}`} pos={[x as number,2.3,z as number]}  r={0.18} h={0.28}      col="#222" rough={0.5} />
          <pointLight key={`l${i}`} position={[x as number, 2.1, z as number]} intensity={0.5} color="#8899ff" distance={3} />
        </>
      ))}

      {/* ═══ RUG ═══ */}
      <Box pos={[0,0.005,-0.0]} size={[5.0,0.015,3.5]} col="#111133" rough={1.0} />
      <Box pos={[0,0.006,-0.0]} size={[4.5,0.008,3.0]} col="#1a1a44" rough={1.0} />
    </>
  );
}
