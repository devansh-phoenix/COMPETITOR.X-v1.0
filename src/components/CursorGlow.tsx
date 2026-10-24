"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface CursorGlowProps {
  children: React.ReactNode;
}

export function CursorGlow({ children }: CursorGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for cursor follow
  const springConfig = { damping: 25, stiffness: 180 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener("change", handler);
    return () => motionQuery.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full"
    >
      {/* Animated soft gradient glow behind the card */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute -inset-2 rounded-3xl pointer-events-none -z-10 blur-2xl transition-opacity duration-500"
          style={{
            opacity: isHovered ? 0.85 : 0.35,
            background: `radial-gradient(400px circle at ${smoothX.get()}px ${smoothY.get()}px, rgba(99, 102, 241, 0.25), rgba(16, 185, 129, 0.15), transparent 70%)`,
          }}
        />
      )}

      {/* Fallback ambient glow for reduced motion */}
      {prefersReducedMotion && (
        <div className="absolute -inset-1 rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/15 blur-xl pointer-events-none -z-10" />
      )}

      {children}
    </div>
  );
}
