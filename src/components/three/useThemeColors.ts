"use client";

import { useEffect, useState } from "react";

export interface Theme3DColors {
  isDark: boolean;
  prefersReducedMotion: boolean;
  isMobile: boolean;
  primary: string;
  accent: string;
  secondary: string;
  ambientLight: string;
  directionalLight: string;
  pointLight: string;
  roughness: number;
  metalness: number;
  transmission: number;
  distortion: number;
}

export function useThemeColors(): Theme3DColors {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // 1. Initial theme check
    const checkDark = () => {
      const hasDarkClass = document.documentElement.classList.contains("dark");
      setIsDark(hasDarkClass);
    };
    checkDark();

    // MutationObserver to watch class changes on <html>
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // 2. Reduced motion check
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    // 3. Mobile / low-power screen check
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mobileQuery.matches);
    const handleMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mobileQuery.addEventListener("change", handleMobileChange);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
      mobileQuery.removeEventListener("change", handleMobileChange);
    };
  }, []);

  if (isDark) {
    return {
      isDark: true,
      prefersReducedMotion,
      isMobile,
      primary: "#6366f1", // vibrant indigo
      accent: "#10b981", // vibrant emerald
      secondary: "#8b5cf6", // rich violet
      ambientLight: "#1e1b4b",
      directionalLight: "#818cf8",
      pointLight: "#34d399",
      roughness: 0.15,
      metalness: 0.2,
      transmission: 0.85,
      distortion: 0.25,
    };
  }

  // Light Mode Colors (gentle, airy, luminous)
  return {
    isDark: false,
    prefersReducedMotion,
    isMobile,
    primary: "#818cf8", // soft periwinkle
    accent: "#6ee7b7", // mint emerald
    secondary: "#c084fc", // lavender
    ambientLight: "#ffffff",
    directionalLight: "#6366f1",
    pointLight: "#10b981",
    roughness: 0.2,
    metalness: 0.1,
    transmission: 0.8,
    distortion: 0.2,
  };
}
