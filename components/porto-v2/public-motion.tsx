"use client";

import { useEffect } from "react";
import { initWebGLMotion } from "./webgl-motion";

export function PublicMotion() {
  useEffect(() => {
    const media = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
    const root = document.querySelector(".porto-v2");
    if (!root) return;
    document.documentElement.dataset.portoMotion = "full";
    const stopWebGL = initWebGLMotion();
    const cleanups = new Map<HTMLElement, () => void>();
    const attach = (stage: HTMLElement) => {
      if (cleanups.has(stage)) return;
      const plane = stage.querySelector<HTMLElement>("[data-motion-plane]");
      if (!plane) return;
      const strength = Number(stage.dataset.motionStage) || 1;
      let frame = 0;
      let x = 0;
      let y = 0;

      const reset = () => {
        window.cancelAnimationFrame(frame);
        plane.style.removeProperty("transition");
        plane.style.removeProperty("transform");
      };
      const move = (event: PointerEvent) => {
        if (!media.matches || document.documentElement.dataset.portoIntro === "loading") return;
        const rect = stage.getBoundingClientRect();
        x = (event.clientX - rect.left) / rect.width * 2 - 1;
        y = (event.clientY - rect.top) / rect.height * 2 - 1;
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          plane.style.transition = "none";
          plane.style.transform = `perspective(900px) rotateX(${-y * 3 * strength}deg) rotateY(${x * 4 * strength}deg) translate3d(${x * 7 * strength}px, ${y * 5 * strength}px, 0)`;
        });
      };

      stage.addEventListener("pointermove", move);
      stage.addEventListener("pointerleave", reset);
      media.addEventListener("change", reset);
      cleanups.set(stage, () => {
        stage.removeEventListener("pointermove", move);
        stage.removeEventListener("pointerleave", reset);
        media.removeEventListener("change", reset);
        reset();
      });
    };
    const attachAll = () => root.querySelectorAll<HTMLElement>("[data-motion-stage]").forEach(attach);
    attachAll();
    const observer = new MutationObserver(attachAll);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      stopWebGL();
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      document.documentElement.dataset.portoMotion = "system";
    };
  }, []);

  return <span className="v2-scroll-progress" aria-hidden="true" />;
}
