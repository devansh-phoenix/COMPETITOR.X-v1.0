"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { Theme3DColors } from "./useThemeColors";

export interface ShapesProps {
  colors: Theme3DColors;
}

export function Shapes({ colors }: ShapesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const icosahedronRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // Subtle mouse parallax
    if (groupRef.current && !colors.prefersReducedMotion) {
      const targetX = state.pointer.x * 0.35;
      const targetY = state.pointer.y * 0.25;
      const rotY = state.pointer.x * 0.15;
      const rotX = -state.pointer.y * 0.12;

      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        targetX,
        0.05
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        rotX,
        0.05
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rotY,
        0.05
      );
    }

    // Individual gentle rotations
    if (!colors.prefersReducedMotion) {
      if (torusRef.current) {
        torusRef.current.rotation.x += delta * 0.25;
        torusRef.current.rotation.y += delta * 0.35;
      }
      if (icosahedronRef.current) {
        icosahedronRef.current.rotation.x += delta * 0.15;
        icosahedronRef.current.rotation.z += delta * 0.2;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Primary Icosahedron (Top-Left) */}
      <Float
        speed={colors.prefersReducedMotion ? 0 : 1.8}
        rotationIntensity={colors.prefersReducedMotion ? 0 : 0.8}
        floatIntensity={colors.prefersReducedMotion ? 0 : 1.4}
        position={[-3.2, 1.4, -1]}
      >
        <mesh ref={icosahedronRef} scale={1.15}>
          <icosahedronGeometry args={[1, 0]} />
          <MeshDistortMaterial
            color={colors.primary}
            roughness={colors.roughness}
            metalness={colors.metalness}
            distort={colors.prefersReducedMotion ? 0 : colors.distortion}
            speed={1.6}
            transparent
            opacity={colors.isDark ? 0.75 : 0.65}
          />
        </mesh>
      </Float>

      {/* 2. Accent Torus (Right-Center) */}
      <Float
        speed={colors.prefersReducedMotion ? 0 : 1.4}
        rotationIntensity={colors.prefersReducedMotion ? 0 : 1.2}
        floatIntensity={colors.prefersReducedMotion ? 0 : 1.6}
        position={[3.4, -0.4, -1.2]}
      >
        <mesh ref={torusRef} scale={0.95}>
          <torusGeometry args={[1.25, 0.4, 24, 48]} />
          <meshStandardMaterial
            color={colors.accent}
            roughness={0.2}
            metalness={0.3}
            transparent
            opacity={colors.isDark ? 0.65 : 0.55}
            wireframe={false}
          />
        </mesh>
      </Float>

      {/* 3. Secondary Luminous Sphere (Top-Right) */}
      <Float
        speed={colors.prefersReducedMotion ? 0 : 1.5}
        rotationIntensity={colors.prefersReducedMotion ? 0 : 0.6}
        floatIntensity={colors.prefersReducedMotion ? 0 : 1.2}
        position={[2.8, 2.0, -2.2]}
      >
        <mesh scale={0.85}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            color={colors.secondary}
            roughness={0.25}
            metalness={0.2}
            distort={colors.prefersReducedMotion ? 0 : 0.22}
            speed={1.8}
            transparent
            opacity={colors.isDark ? 0.6 : 0.5}
          />
        </mesh>
      </Float>

      {/* 4. Octahedron (Bottom-Left) */}
      <Float
        speed={colors.prefersReducedMotion ? 0 : 1.2}
        rotationIntensity={colors.prefersReducedMotion ? 0 : 1.0}
        floatIntensity={colors.prefersReducedMotion ? 0 : 1.2}
        position={[-2.8, -1.8, -1.6]}
      >
        <mesh scale={0.9}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={colors.secondary}
            roughness={0.3}
            metalness={0.25}
            transparent
            opacity={colors.isDark ? 0.7 : 0.55}
          />
        </mesh>
      </Float>

      {/* 5. Small Floating Gem Sphere (Bottom-Center/Right) */}
      <Float
        speed={colors.prefersReducedMotion ? 0 : 2.0}
        rotationIntensity={colors.prefersReducedMotion ? 0 : 0.5}
        floatIntensity={colors.prefersReducedMotion ? 0 : 1.8}
        position={[1.2, -2.4, -1.5]}
      >
        <mesh scale={0.45}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            color={colors.accent}
            roughness={0.15}
            metalness={0.4}
            distort={colors.prefersReducedMotion ? 0 : 0.3}
            speed={2.2}
            transparent
            opacity={colors.isDark ? 0.8 : 0.7}
          />
        </mesh>
      </Float>
    </group>
  );
}
