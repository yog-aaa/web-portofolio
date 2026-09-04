"use client";

import { useActionState, useEffect, useRef, useState, type CSSProperties } from "react";
import { useFormStatus } from "react-dom";
import { saveThemeSettingsAction } from "@/app/admin/(protected)/settings/actions";
import { defaultThemeColors, type AdminThemeSettings, type ThemeColorKey } from "@/lib/domain/settings";
import { initialAdminActionState } from "@/lib/validation/admin-content";
import { fieldClass, helpClass, labelClass } from "./admin-ui";

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

const controls: { key: ThemeColorKey; label: string; description: string }[] = [
  { key: "background", label: "Background", description: "Primary page canvas" },
  { key: "surface", label: "Surface", description: "Editorial sections and controls" },
  { key: "foreground", label: "Foreground", description: "Primary text" },
  { key: "border", label: "Border", description: "Dividers and field outlines" },
  { key: "accent", label: "Accent", description: "Primary actions and emphasis" },
  { key: "accentSecondary", label: "Accent secondary", description: "Supporting emphasis" },
  { key: "accentForeground", label: "Accent foreground", description: "Text placed on the accent" },
  { key: "accentSoft", label: "Accent soft", description: "Quiet highlighted surfaces" },
];

function ThemeSubmit() {
  const { pending } = useFormStatus();
  return <div className="flex flex-wrap justify-end gap-3">
    <button type="submit" name="intent" value="reset" disabled={pending}
      className="transition-interactive min-h-target rounded-control border border-border-control bg-surface px-5 py-3 font-medium hover:border-accent disabled:opacity-60">Reset defaults</button>
    <button type="submit" name="intent" value="save" disabled={pending}
      className="transition-interactive min-h-target rounded-control bg-accent px-5 py-3 font-medium text-accent-foreground hover:bg-accent-deep disabled:opacity-60">{pending ? "Saving…" : "Save theme"}</button>
  </div>;
}

export function ThemeSettingsForm({ settings }: { settings: AdminThemeSettings | null }) {
  const initial = Object.fromEntries(controls.map(({ key }) => [key, settings?.[key] ?? defaultThemeColors[key]])) as Record<ThemeColorKey, string>;
  const [colors, setColors] = useState(initial);
  const [state, action] = useActionState(saveThemeSettingsAction, initialAdminActionState);
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "error") errorRef.current?.focus();
  }, [state]);
  const style = {
    "--background": colors.background, "--surface": colors.surface,
    "--foreground": colors.foreground, "--foreground-secondary": colors.foreground,
    "--border": colors.border, "--border-control": colors.foreground,
    "--accent": colors.accent, "--accent-deep": colors.accent,
    "--accent-secondary": colors.accentSecondary,
    "--accent-foreground": colors.accentForeground, "--accent-soft": colors.accentSoft,
    "--accent-very-soft": colors.accentSoft, "--focus-ring": colors.foreground,
    "--focus-ring-offset": colors.surface,
  } as ThemeStyle;
  return <form action={action} className="space-y-10">
    <input type="hidden" name="expectedUpdatedAt" value={settings?.updatedAt ?? ""} />
    {state.status === "error" ? <div ref={errorRef} tabIndex={-1} role="alert" className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-caption text-red-900">
      <p className="font-medium">Could not save</p><p className="mt-1">{state.message}</p>
      {state.fields ? <ul className="mt-2 list-disc pl-5">{Object.values(state.fields).flat().map((message) => <li key={message}>{message}</li>)}</ul> : null}
    </div> : null}
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
      <div className="grid gap-6 sm:grid-cols-2">{controls.map(({ key, label, description }) => <div key={key}>
        <label htmlFor={key} className={labelClass}>{label}</label>
        <div className="flex gap-3">
          <input aria-label={`${label} color picker`} type="color"
            value={/^#[0-9A-Fa-f]{6}$/.test(colors[key]) ? colors[key] : defaultThemeColors[key]}
            onChange={(event) => setColors((current) => ({ ...current, [key]: event.target.value.toUpperCase() }))}
            className="h-12 w-14 shrink-0 cursor-pointer rounded-control border border-border-control bg-surface p-1" />
          <input id={key} name={key} value={colors[key]} maxLength={7} pattern="#[0-9A-Fa-f]{6}" required
            onChange={(event) => setColors((current) => ({ ...current, [key]: event.target.value }))} className={fieldClass} />
        </div><p className={helpClass}>{description}</p>
      </div>)}</div>

      <aside className="xl:sticky xl:top-8 xl:self-start" aria-label="Live theme preview">
        <p className="type-metadata mb-3 text-foreground-secondary">LIVE PREVIEW</p>
        <div style={style} className="overflow-hidden border border-border bg-background text-foreground">
          <div className="border-b border-border bg-surface px-5 py-4 text-sm font-medium">YOGAAA.</div>
          <div className="p-6 sm:p-8"><p className="font-mono text-xs tracking-[0.14em] text-accent-secondary">SOFTWARE · AI · RESEARCH</p>
            <h2 className="mt-5 max-w-[12ch] text-3xl font-medium leading-tight">Calm technology, clearly expressed.</h2>
            <p className="mt-4 text-sm opacity-75">A preview of typography, dividers, surfaces, and semantic emphasis.</p>
            <button type="button" className="mt-7 rounded-control bg-accent px-4 py-3 text-sm font-medium text-accent-foreground">Primary action</button>
            <div className="mt-7 border-l-2 border-accent bg-accent-soft px-4 py-3 text-sm">Restrained accent surface</div>
          </div>
        </div>
      </aside>
    </div>
    <div className="sticky bottom-4 border border-border bg-surface/95 p-4 shadow-sm backdrop-blur"><ThemeSubmit /></div>
  </form>;
}
