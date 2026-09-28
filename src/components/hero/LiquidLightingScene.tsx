import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type LightingSceneMode = 'ambient' | 'focus' | 'warm';

interface LiquidLightingSceneProps {
  mode: LightingSceneMode;
}

const modeSettings = {
  ambient: { light: '#d8ecff', glow: '#b8e7ff', intensity: 1.7 },
  focus: { light: '#fff4c2', glow: '#ffd21a', intensity: 2.25 },
  warm: { light: '#ffbd6f', glow: '#ff8d4d', intensity: 2 },
} as const;

function CameraRig() {
  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 0.32, 0.035);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.pointer.y * 0.2, 0.035);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

function Cable({ x }: { x: number }) {
  return (
    <mesh position={[x, 1.36, 0]}>
      <cylinderGeometry args={[0.012, 0.012, 2.3, 10]} />
      <meshStandardMaterial color="#3d4650" metalness={0.95} roughness={0.32} />
    </mesh>
  );
}

function Luminaire({ mode }: { mode: LightingSceneMode }) {
  const rig = useRef<THREE.Group>(null);
  const settings = modeSettings[mode];

  useFrame((state) => {
    if (!rig.current) return;
    const time = state.clock.getElapsedTime();
    rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, state.pointer.x * 0.32 + Math.sin(time * 0.32) * 0.08, 0.045);
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, -state.pointer.y * 0.14, 0.045);
    rig.current.position.y = Math.sin(time * 0.75) * 0.08;
  });

  return (
    <group ref={rig} position={[0.55, 0.02, 0]} rotation={[-0.14, -0.22, 0]} scale={0.9}>
      <Cable x={-1.68} />
      <Cable x={1.68} />

      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.35, 0.22, 0.30]} />
        <meshPhysicalMaterial color="#38291f" metalness={0.82} roughness={0.28} clearcoat={0.8} clearcoatRoughness={0.16} />
      </mesh>
      <mesh position={[0, -0.115, 0.035]}>
        <boxGeometry args={[4.02, 0.065, 0.17]} />
        <meshStandardMaterial color={settings.light} emissive={settings.glow} emissiveIntensity={settings.intensity} toneMapped={false} />
      </mesh>
      <mesh position={[-2.03, 0, 0]}>
        <boxGeometry args={[0.12, 0.38, 0.34]} />
        <meshStandardMaterial color="#303940" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[2.03, 0, 0]}>
        <boxGeometry args={[0.12, 0.38, 0.34]} />
        <meshStandardMaterial color="#303940" metalness={0.85} roughness={0.3} />
      </mesh>

      <mesh position={[0.15, 0.72, -0.18]} rotation={[0.22, 0.48, 0.02]}>
        <boxGeometry args={[2.6, 1.2, 0.05]} />
        <meshPhysicalMaterial color="#dcecff" transparent opacity={0.16} roughness={0.05} metalness={0.05} transmission={0.62} thickness={0.3} />
      </mesh>
      <mesh position={[1.2, 0.64, 0.36]}>
        <icosahedronGeometry args={[0.22, 2]} />
        <meshPhysicalMaterial color={settings.glow} transparent opacity={0.52} roughness={0.05} metalness={0.05} transmission={0.72} thickness={0.45} emissive={settings.glow} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[-1.55, -0.03, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.012, 8, 48]} />
        <meshBasicMaterial color={settings.glow} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function Particles({ mode }: { mode: LightingSceneMode }) {
  const points = useRef<THREE.Points>(null);
  const settings = modeSettings[mode];
  const positions = useMemo(() => {
    const values = new Float32Array(108);
    for (let index = 0; index < values.length; index += 3) {
      values[index] = (Math.random() - 0.5) * 6.5;
      values[index + 1] = (Math.random() - 0.5) * 3.8;
      values[index + 2] = (Math.random() - 0.5) * 2;
    }
    return values;
  }, []);

  useFrame((state) => {
    if (points.current) points.current.rotation.y = state.clock.getElapsedTime() * 0.035;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={settings.glow} size={0.028} transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

function LightingWorld({ mode }: { mode: LightingSceneMode }) {
  const settings = modeSettings[mode];
  return (
    <>
      <ambientLight intensity={0.7} color="#9db5d0" />
      <pointLight position={[1.8, 1.8, 2.2]} color={settings.glow} intensity={5.5} distance={8} />
      <pointLight position={[-3, -1.2, 1.2]} color="#557a9e" intensity={2.1} distance={7} />
      <Luminaire mode={mode} />
      <Particles mode={mode} />
      <CameraRig />
    </>
  );
}

export const LiquidLightingScene: React.FC<LiquidLightingSceneProps> = ({ mode }) => (
  <Canvas
    dpr={[1, 1.5]}
    camera={{ position: [0, 0.15, 6.3], fov: 38 }}
    gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
  >
    <LightingWorld mode={mode} />
  </Canvas>
);
