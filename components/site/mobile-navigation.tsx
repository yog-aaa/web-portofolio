"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type NavigationItem = { label: string; href: string };

export function MobileNavigation({ items, pathname, contactHref, contactLabel }:
  { items: NavigationItem[]; pathname: string; contactHref?: string; contactLabel?: string | null }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }

  return <div className="md:hidden">
    <button ref={trigger} type="button" aria-expanded={open} aria-controls="mobile-navigation"
      onClick={() => setOpen(true)} className="type-metadata min-h-target min-w-target text-foreground">
      Menu
    </button>
    <dialog ref={dialog} id="mobile-navigation" aria-label="Primary navigation"
      onCancel={(event) => { event.preventDefault(); close(); }}
      onClose={() => setOpen(false)}
      className="m-0 h-svh max-h-none w-full max-w-none bg-background p-0 text-foreground backdrop:bg-foreground/20">
      <div className="container-site flex h-full flex-col">
        <div className="flex min-h-20 items-center justify-end border-b border-border">
          <button type="button" autoFocus onClick={close} className="type-metadata min-h-target min-w-target">Close</button>
        </div>
        <nav className="flex flex-1 flex-col justify-center py-10" aria-label="Mobile primary">
          <ul className="divide-y divide-border border-y border-border">
            {items.map((item, index) => <li key={item.href}>
              <Link href={item.href} onClick={close} aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined}
                className="group flex min-h-16 items-center justify-between py-3 text-h3">
                <span>{item.label}</span><span className="type-metadata text-foreground-secondary">0{index + 1}</span>
              </Link>
            </li>)}
          </ul>
          {contactHref && contactLabel ? <a href={contactHref} onClick={close}
            className="mt-8 inline-flex min-h-target items-center self-start border-b border-border-control text-h3">
            {contactLabel} <span aria-hidden="true" className="ml-2">↗</span>
          </a> : null}
        </nav>
      </div>
    </dialog>
  </div>;
}
