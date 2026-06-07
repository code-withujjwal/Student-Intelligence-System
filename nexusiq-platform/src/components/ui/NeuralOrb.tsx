"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function NeuralOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 400;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const CX = SIZE / 2;
    const CY = SIZE / 2;

    const drawOrb = (t: number) => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // ─── Outer ambient glow ───
      const outerGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, 175);
      outerGrad.addColorStop(0, "rgba(99,102,241,0.0)");
      outerGrad.addColorStop(0.45, "rgba(99,102,241,0.06)");
      outerGrad.addColorStop(0.75, "rgba(139,92,246,0.08)");
      outerGrad.addColorStop(1, "rgba(6,182,212,0.0)");
      ctx.beginPath();
      ctx.arc(CX, CY, 175, 0, Math.PI * 2);
      ctx.fillStyle = outerGrad;
      ctx.fill();

      // ─── Concentric orbit rings ───
      const rings = [
        { r: 150, color: "rgba(99,102,241,", speed: 0.0, base: 0.06 },
        { r: 125, color: "rgba(139,92,246,", speed: 0.0, base: 0.07 },
        { r: 98, color: "rgba(6,182,212,", speed: 0.0, base: 0.05 },
      ];
      rings.forEach(({ r, color, base }, i) => {
        ctx.beginPath();
        ctx.arc(CX, CY, r, 0, Math.PI * 2);
        const alpha = base + Math.sin(t * 1.5 + i) * 0.025;
        ctx.strokeStyle = `${color}${alpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 12]);
        ctx.lineDashOffset = -t * 30 * (i % 2 === 0 ? 1 : -1);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // ─── Orbiting node clusters ───
      const clusters = [
        { r: 128, speed: 0.45, nodeCount: 6, dotR: 2.5, color: "#6366F1", trail: true },
        { r: 100, speed: -0.65, nodeCount: 8, dotR: 2.0, color: "#8B5CF6", trail: false },
        { r: 73, speed: 1.1, nodeCount: 5, dotR: 1.5, color: "#06B6D4", trail: true },
      ];

      clusters.forEach(({ r, speed, nodeCount, dotR, color, trail }) => {
        const baseAngle = t * speed;
        for (let j = 0; j < nodeCount; j++) {
          const a = baseAngle + (j / nodeCount) * Math.PI * 2;
          const nx = CX + r * Math.cos(a);
          const ny = CY + r * Math.sin(a);

          // Trail dots
          if (trail) {
            for (let k = 1; k <= 4; k++) {
              const ta = a - k * 0.12;
              const tx = CX + r * Math.cos(ta);
              const ty = CY + r * Math.sin(ta);
              ctx.beginPath();
              ctx.arc(tx, ty, dotR * (1 - k * 0.2), 0, Math.PI * 2);
              ctx.fillStyle = `${color}${Math.round((0.3 - k * 0.06) * 255).toString(16).padStart(2, '0')}`;
              ctx.fill();
            }
          }

          // Main node glow
          const nodeGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, dotR * 3);
          nodeGlow.addColorStop(0, color + "cc");
          nodeGlow.addColorStop(1, color + "00");
          ctx.beginPath();
          ctx.arc(nx, ny, dotR * 3, 0, Math.PI * 2);
          ctx.fillStyle = nodeGlow;
          ctx.fill();

          // Main node
          ctx.beginPath();
          ctx.arc(nx, ny, dotR, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      });

      // ─── Neural connection lines ───
      const connectRadius = 128;
      const baseA = t * 0.45;
      for (let i = 0; i < 6; i++) {
        const a1 = baseA + (i / 6) * Math.PI * 2;
        const x1 = CX + connectRadius * Math.cos(a1);
        const y1 = CY + connectRadius * Math.sin(a1);
        for (let j = i + 2; j < 6; j += 2) {
          const a2 = baseA + (j / 6) * Math.PI * 2;
          const x2 = CX + connectRadius * Math.cos(a2);
          const y2 = CY + connectRadius * Math.sin(a2);
          const alpha = 0.04 + Math.sin(t * 2 + i + j) * 0.03;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // ─── Pulsing core ───
      const pulseR = 36 + Math.sin(t * 1.8) * 5;
      const coreGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, pulseR);
      coreGrad.addColorStop(0, "rgba(255,255,255,0.95)");
      coreGrad.addColorStop(0.25, "rgba(200,200,255,0.85)");
      coreGrad.addColorStop(0.5, "rgba(139,92,246,0.7)");
      coreGrad.addColorStop(0.75, "rgba(99,102,241,0.4)");
      coreGrad.addColorStop(1, "rgba(99,102,241,0.0)");
      ctx.beginPath();
      ctx.arc(CX, CY, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // ─── Core glow ring ───
      const glowR = 56 + Math.sin(t * 1.8) * 7;
      const glowGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, glowR);
      glowGrad.addColorStop(0, "rgba(99,102,241,0.45)");
      glowGrad.addColorStop(0.5, "rgba(139,92,246,0.2)");
      glowGrad.addColorStop(1, "rgba(99,102,241,0.0)");
      ctx.beginPath();
      ctx.arc(CX, CY, glowR, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // ─── Floating data points (random sparks) ───
      for (let i = 0; i < 5; i++) {
        const angle = t * 0.3 + i * 1.257;
        const dist = 55 + Math.sin(t * 0.7 + i * 2.1) * 20;
        const sx = CX + dist * Math.cos(angle);
        const sy = CY + dist * Math.sin(angle);
        const sparkA = 0.3 + Math.sin(t * 3 + i) * 0.25;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6,182,212,${sparkA})`;
        ctx.fill();
      }
    };

    const animate = () => {
      timeRef.current += 0.007;
      drawOrb(timeRef.current);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <motion.div
      className="relative flex items-center justify-center"
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Outer ambient ring */}
      <div className="absolute w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-full border border-indigo-500/8 animate-ping" style={{ animationDuration: "3s" }} />

      <canvas
        ref={canvasRef}
        className="w-[280px] h-[280px] md:w-[380px] md:h-[380px] drop-shadow-[0_0_80px_rgba(99,102,241,0.55)]"
      />
    </motion.div>
  );
}
