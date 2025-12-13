"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface DotPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
  glow?: boolean;
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
}: DotPatternProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let dots: { x: number; y: number; opacity: number; speed: number; offset: number }[] = [];

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      // Set actual canvas size to match display size for sharp rendering on high DPI
      const dpr = window.devicePixelRatio || 1;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.scale(dpr, dpr);

      // Re-initialize dots
      dots = [];
      const cols = Math.ceil(innerWidth / width);
      const rows = Math.ceil(innerHeight / height);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({
            x: i * width + cx + x,
            y: j * height + cy + y,
            opacity: Math.random(),
            speed: 0.002 + Math.random() * 0.003, // Slower, more subtle speed
            offset: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Use the color from the class or default to neutral-400
      // We'll use a fixed color for performance, assuming the class sets the base tone
      ctx.fillStyle = "rgb(163 163 163)"; // neutral-400

      const time = performance.now();

      dots.forEach((dot) => {
        let opacity = 0.2; // Base opacity

        if (glow) {
          // Sine wave for glowing effect: oscillates between 0.2 and 0.6
          // Math.sin returns -1 to 1. 
          // (Math.sin(...) + 1) / 2 returns 0 to 1.
          const wave = (Math.sin(time * dot.speed + dot.offset) + 1) / 2;
          opacity = 0.2 + wave * 0.4; 
        }

        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, cr, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height, x, y, cx, cy, cr, glow]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden="true"
    />
  );
}
