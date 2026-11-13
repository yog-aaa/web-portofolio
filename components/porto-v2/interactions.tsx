"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";

const themeKey = "porto-v2-theme";
const themeEvent = "porto-v2-theme-change";
const subscribeTheme = (callback: () => void) => {
  window.addEventListener(themeEvent, callback);
  return () => window.removeEventListener(themeEvent, callback);
};
const getTheme = () => localStorage.getItem(themeKey) === "dark";
const getServerTheme = () => false;

export function LandingIntro() {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setLeaving(true), reduced ? 0 : 650);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = document.querySelector<HTMLElement>(".v2-hero-stage");
    if (!hero) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => hero.style.setProperty("--v2-hero-progress", String(Math.min(1, Math.max(0, scrollY / 750)))));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => { window.removeEventListener("scroll", update); cancelAnimationFrame(frame); };
  }, []);
  return <div className="v2-intro" data-leaving={leaving} aria-hidden="true"><span>YOGAAA.</span></div>;
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
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close() { setOpen(false); trigger.current?.focus(); }
  return <><button ref={trigger} type="button" className="v2-menu-trigger" aria-expanded={open} aria-controls="v2-mobile-menu" onClick={() => setOpen(true)}>MENU</button><div ref={menu} id="v2-mobile-menu" className="v2-mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation" hidden={!open}><div className="v2-menu-top"><span>YOGAAA.</span><button ref={closeButton} type="button" onClick={close}>CLOSE ×</button></div><nav aria-label="Mobile navigation"><a onClick={close} href="#selected-work">Work</a><a onClick={close} href="#experience">Experience</a><Link onClick={close} href="/research">Research</Link><Link onClick={close} href="/thoughts">Thoughts</Link><Link onClick={close} href="/about">About</Link></nav><a className="v2-menu-contact" href="https://www.linkedin.com/in/yoga-agustiansyah/" target="_blank" rel="noreferrer">LET&apos;S COLLABORATE ↗</a></div></>;
}
