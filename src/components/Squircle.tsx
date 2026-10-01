"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { initCorners } from "@spatio-labs/squircle/corners";

// Boots the squircle runtime once: every element with
// data-corner-shape="squircle" gets a true continuous corner (SwiftUI-style)
// via clip-path, with a plain border-radius fallback when JS is off.
export function CornersInit() {
  useEffect(() => {
    initCorners();
  }, []);
  return null;
}

interface SquircleProps {
  radius?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  id?: string;
}

// A div with a genuine squircle corner. The radius prop sets the corner
// size; the runtime redraws it as a continuous curve.
export function Squircle({ radius = 20, className = "", style, children, id }: SquircleProps) {
  return (
    <div
      id={id}
      data-corner-shape="squircle"
      className={className}
      style={{ borderRadius: radius, ...style }}
    >
      {children}
    </div>
  );
}
