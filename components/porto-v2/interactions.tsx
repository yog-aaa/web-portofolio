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
      window.setTimeout(() => { if (!cancelled) root.dataset.portoIntro = "done"; }, 1700);
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
    const next = !(requestedDark.current ?? getTheme());
    requestedDark.current = next;
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const update = () => {
      document.documentElement.dataset.portoTheme = next ? "dark" : "light";
      localStorage.setItem(themeKey, next ? "dark" : "light");
      window.dispatchEvent(new Event(themeEvent));
    };
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) { update(); return; }
    const transition = document.startViewTransition(update);
    void transition.ready.then(() => {
      document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] }, { duration: 520, easing: "cubic-bezier(.2,.7,.2,1)", pseudoElement: "::view-transition-new(root)" });
    }).catch(() => {});
  }

  return <button type="button" className="v2-theme-toggle" onClick={toggle} aria-label={`Switch to ${dark ? "light" : "dark"} mode`} aria-pressed={dark}><span className="v2-theme-label">{dark ? "LIGHT MODE" : "DARK MODE"}</span><span className="v2-theme-icon" aria-hidden="true">{dark ? "☼" : "☾"}</span></button>;
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
  return <><button ref={trigger} type="button" className="v2-menu-trigger" aria-expanded={open} aria-haspopup="dialog" aria-controls="v2-mobile-menu" onClick={() => setOpen(true)}>MENU</button><div ref={menu} id="v2-mobile-menu" className="v2-mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation" aria-hidden={!open} inert={!open} data-open={open}><div className="v2-menu-top"><span>YOGAAA.</span><button ref={closeButton} type="button" onClick={close}>CLOSE ×</button></div><nav aria-label="Mobile navigation"><a onClick={close} href="#selected-work">Work</a><a onClick={close} href="#experience">Experience</a><Link onClick={close} href="/research">Research</Link><Link onClick={close} href="/thoughts">Thoughts</Link><Link onClick={close} href="/about">About</Link></nav><a className="v2-menu-contact" href="https://www.linkedin.com/in/yoga-agustiansyah/" target="_blank" rel="noreferrer">LET&apos;S COLLABORATE ↗</a></div></>;
}
