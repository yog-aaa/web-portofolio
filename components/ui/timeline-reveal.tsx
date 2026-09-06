"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Progressive enhancement: content stays visible without JavaScript or motion support. */
export function TimelineReveal({ children }: { children: ReactNode }) {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const element = list.current;
    if (!element || !("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (motion.matches) continue;
        const animation = entry.target.animate([
          { opacity: 0.55, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 480, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    for (const item of element.children) observer.observe(item);
    const stopMotion = () => {
      if (motion.matches) {
        for (const animation of animations) animation.cancel();
        animations.clear();
      }
    };
    motion.addEventListener("change", stopMotion);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", stopMotion);
      for (const animation of animations) animation.cancel();
    };
  }, []);

  return <ol ref={list} className="border-y border-border py-8 md:py-10">{children}</ol>;
}
