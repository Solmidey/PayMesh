"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

function Blob() {
  const geom = useMemo(() => new THREE.IcosahedronGeometry(1.2, 2), []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#7c5cff"),
        roughness: 0.3,
        metalness: 0.6,
        emissive: new THREE.Color("#3e2eff").multiplyScalar(0.2)
      }),
    []
  );
  useEffect(() => () => {
    geom.dispose();
    mat.dispose();
  }, [geom, mat]);
  return <mesh geometry={geom} material={mat} rotation={[0.3, 0.2, 0]} />;
}

export default function Hero3D() {
  return (
    <div className="h-64 w-full rounded-2xl overflow-hidden border border-white/10 bg-black/20">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2,2,2]} intensity={1.1} />
        <Blob />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.4} />
      </Canvas>
    </div>
  );
}
