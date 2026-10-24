"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useThemeColors } from "./useThemeColors";
import { Shapes } from "./shapes";

export default function HeroScene() {
  const colors = useThemeColors();

  // Mobile / Low-Power Fallback: Lightweight CSS gradient mesh with zero WebGL overhead
  if (colors.isMobile) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          className={`absolute top-1/4 -left-20 w-80 h-80 rounded-full blur-3xl opacity-30 ${
            colors.isDark ? "bg-indigo-600" : "bg-indigo-300"
          }`}
        />
        <div
          className={`absolute bottom-1/4 -right-20 w-80 h-80 rounded-full blur-3xl opacity-25 ${
            colors.isDark ? "bg-emerald-500" : "bg-emerald-300"
          }`}
        />
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            colors.isDark ? "bg-purple-600" : "bg-purple-300"
          }`}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 1.5]} // Balance high resolution and battery performance
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={colors.isDark ? 0.7 : 0.9} color={colors.ambientLight} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={colors.isDark ? 1.5 : 1.2}
            color={colors.directionalLight}
          />
          <pointLight
            position={[-5, -4, 2]}
            intensity={colors.isDark ? 1.2 : 0.8}
            color={colors.pointLight}
          />
          <Shapes colors={colors} />
        </Suspense>
      </Canvas>

      {/* Radial vignette overlay ensuring headline and input card readability (WCAG AA) */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          colors.isDark
            ? "bg-[radial-gradient(ellipse_at_center,rgba(9,13,22,0.4)_0%,rgba(9,13,22,0.85)_100%)]"
            : "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.45)_0%,rgba(248,250,252,0.8)_100%)]"
        }`}
      />
    </div>
  );
}
