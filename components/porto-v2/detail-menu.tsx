"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const links = [["Work", "/work"], ["Experience", "/experience"], ["Research", "/research"], ["Thoughts", "/thoughts"], ["About", "/about"]] as const;

export function DetailMenu() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return <><button ref={trigger} className="v2-menu-trigger" type="button" aria-expanded={open} aria-controls="v2-detail-menu" onClick={() => setOpen(true)}>MENU</button><div id="v2-detail-menu" className="v2-mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation" hidden={!open}><div className="v2-menu-top"><Link href="/" onClick={() => setOpen(false)}>YOGAAA.</Link><button ref={closeButton} type="button" onClick={() => { setOpen(false); trigger.current?.focus(); }}>CLOSE ×</button></div><nav aria-label="Mobile navigation">{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}</nav><a className="v2-menu-contact" href="https://www.linkedin.com/in/yoga-agustiansyah/" target="_blank" rel="noreferrer">LET&apos;S COLLABORATE ↗</a></div></>;
}
