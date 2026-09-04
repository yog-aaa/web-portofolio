"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maximum = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(maximum > 0 ? Math.min(100, Math.max(0, (window.scrollY / maximum) * 100)) : 100);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 bg-border" role="progressbar"
    aria-label="Article reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
    <span className="block h-full origin-left bg-accent-deep motion-safe:transition-transform motion-safe:duration-(--duration-fast)"
      style={{ transform: `scaleX(${progress / 100})` }} />
  </div>;
}
