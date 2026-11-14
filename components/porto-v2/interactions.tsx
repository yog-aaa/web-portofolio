"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";

const themeKey = "porto-v2-theme";
const themeEvent = "porto-v2-theme-change";
const subscribeTheme = (callback: () => void) => {
  window.addEventListener(themeEvent, callback);
  return () => window.removeEventListener(themeEvent, callback);
};
const getTheme = () => localStorage.getItem(themeKey) === "dark";
const getServerTheme = () => false;

function inkEdge(x: number, y: number, radius: number, phase: number) {
  const points = 96;
  return `polygon(${Array.from({ length: points }, (_, index) => {
    const angle = index * Math.PI * 2 / points;
    const ripple = 1 + .105 * Math.sin(angle * 7 + phase) + .04 * Math.sin(angle * 15 - phase * .7) + .018 * Math.cos(angle * 23 + phase);
    return `${(x + Math.cos(angle) * radius * ripple).toFixed(1)}px ${(y + Math.sin(angle) * radius * ripple).toFixed(1)}px`;
  }).join(",")})`;
}

export function LandingIntro() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.portoIntro !== "loading") return;

    let cancelled = false;
    let stopWatching = () => {};
    const contentReady = new Promise<HTMLImageElement>((resolve) => {
      const check = () => {
        const portrait = document.querySelector<HTMLImageElement>(".v2-portrait");
        if (!portrait || !document.querySelector("#selected-work") || !document.querySelector("#experience") || !document.querySelector(".v2-learning") || !document.querySelector(".v2-closing")) return;
        observer.disconnect();
        resolve(portrait);
      };
      const observer = new MutationObserver(check);
      observer.observe(root, { childList: true, subtree: true });
      stopWatching = () => observer.disconnect();
      check();
    });
    const essentialsReady = Promise.allSettled([document.fonts.ready, contentReady.then((portrait) => portrait.decode())]);
    const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, 6000));

    void Promise.race([essentialsReady, timeout]).then(() => {
      stopWatching();
      if (cancelled) return;
      try { sessionStorage.setItem("porto-v2-intro-seen", "1"); } catch {}
      root.dataset.portoIntro = "reveal";
      window.setTimeout(() => { if (!cancelled) root.dataset.portoIntro = "done"; }, 2100);
    });
    return () => { cancelled = true; stopWatching(); };
  }, []);

  return <div className="v2-intro" aria-hidden="true">
    <div className="v2-intro-panel v2-intro-panel-left" />
    <div className="v2-intro-panel v2-intro-panel-right" />
    <div className="v2-intro-content">
      <div className="v2-intro-top"><span>YOGA AGUSTIANSYAH</span><span>PORTFOLIO 2026</span></div>
      <div className="v2-intro-center">
        <Image src="/porto-v2/yogaaa-mark.png" alt="" width={64} height={64} />
        <strong>YOGAAA.</strong>
        <span>SOFTWARE · DESIGN · EXPLORATION</span>
        <i className="v2-intro-progress" />
        <small>PREPARING THE EXPERIENCE</small>
      </div>
      <div className="v2-intro-bottom"><span>A QUIETER START</span><span>00 / 05</span></div>
    </div>
  </div>;
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
  const requestedDark = useRef<boolean | null>(null);
  useEffect(() => {
    document.documentElement.dataset.portoTheme = getTheme() ? "dark" : "light";
    requestedDark.current = getTheme();
  }, []);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const button = event.currentTarget;
    if (button.dataset.themeTransition === "true") return;
    const next = !(requestedDark.current ?? getTheme());
    requestedDark.current = next;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const update = () => {
      document.documentElement.dataset.portoTheme = next ? "dark" : "light";
      localStorage.setItem(themeKey, next ? "dark" : "light");
      window.dispatchEvent(new Event(themeEvent));
    };
    if (!document.startViewTransition) { update(); return; }
    button.dataset.themeTransition = "true";
    document.documentElement.style.setProperty("--v2-ink-x", `${x}px`);
    document.documentElement.style.setProperty("--v2-ink-y", `${y}px`);
    const transition = document.startViewTransition(update);
    void transition.finished.finally(() => {
      delete button.dataset.themeTransition;
      document.documentElement.style.removeProperty("--v2-ink-x");
      document.documentElement.style.removeProperty("--v2-ink-y");
    });
    void transition.ready.then(() => {
      document.documentElement.animate({
        clipPath: [inkEdge(x, y, 2, 0), inkEdge(x, y, radius * .27, .8), inkEdge(x, y, radius * .67, 1.7), inkEdge(x, y, radius * 1.35, 2.4)],
        offset: [0, .3, .68, 1],
      }, { duration: 900, easing: "cubic-bezier(0.77, 0, 0.175, 1)", fill: "forwards", pseudoElement: "::view-transition-new(root)" });
    }).catch(() => {});
  }

  return <button type="button" className="v2-theme-toggle" onClick={toggle} aria-label={`Switch to ${dark ? "light" : "dark"} mode`} aria-pressed={dark} title={`Switch to ${dark ? "light" : "dark"} mode`}><svg className="v2-theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{dark ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></> : <path d="M20.7 13.1A8.7 8.7 0 0 1 10.9 3.3 8.7 8.7 0 1 0 20.7 13.1Z"/>}</svg></button>;
}

export function LandingInteractions() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
      if (event.key !== "Tab") return;
      const items = menu.current?.querySelectorAll<HTMLElement>("a, button");
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previousOverflow; };
  }, [open]);

  function close() { setOpen(false); trigger.current?.focus(); }
  return <><button ref={trigger} type="button" className="v2-menu-trigger" aria-expanded={open} aria-haspopup="dialog" aria-controls="v2-mobile-menu" onClick={() => setOpen(true)}>MENU</button><div ref={menu} id="v2-mobile-menu" className="v2-mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation" aria-hidden={!open} inert={!open} data-open={open}><div className="v2-menu-top"><span>YOGAAA.</span><button ref={closeButton} type="button" onClick={close}>CLOSE ×</button></div><nav aria-label="Mobile navigation"><Link onClick={close} href="/work">Work</Link><Link onClick={close} href="/experience">Experience</Link><Link onClick={close} href="/research">Research</Link><Link onClick={close} href="/thoughts">Thoughts</Link><Link onClick={close} href="/about">About</Link></nav><a className="v2-menu-contact" href="https://www.linkedin.com/in/yoga-agustiansyah/" target="_blank" rel="noreferrer">LET&apos;S COLLABORATE ↗</a></div></>;
}
