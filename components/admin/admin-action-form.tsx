"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { initialAdminActionState, type AdminActionState } from "@/lib/validation/admin-content";

type Action = (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;

export function AdminActionForm({ action, children, className = "space-y-8" }: {
  action: Action; children: React.ReactNode; className?: string;
}) {
  const [state, formAction] = useActionState(action, initialAdminActionState);
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "error") errorRef.current?.focus();
  }, [state]);
  return <form action={formAction} className={className}>
    {state.status === "error" ? <div ref={errorRef} tabIndex={-1} role="alert" className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-caption text-red-900">
      <p className="font-medium">Could not save</p><p className="mt-1">{state.message}</p>
      {state.fields ? <ul className="mt-2 list-disc pl-5">{Object.entries(state.fields).flatMap(([field, messages]) => messages.map((message) => <li key={`${field}-${message}`}>{message}</li>))}</ul> : null}
    </div> : null}
    {children}
  </form>;
}

export function SubmitButton({ name, value, children, tone = "primary" }: {
  name?: string; value?: string; children: React.ReactNode; tone?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();
  const style = tone === "primary" ? "bg-accent text-accent-foreground hover:bg-accent-deep" : tone === "danger"
    ? "border border-red-300 text-red-800 hover:bg-red-50" : "border border-border-control bg-surface text-foreground hover:border-accent";
  return <button type="submit" name={name} value={value} disabled={pending}
    className={`transition-interactive inline-flex min-h-target items-center justify-center rounded-control px-5 py-3 font-medium disabled:cursor-wait disabled:opacity-60 ${style}`}>
    {pending ? "Working…" : children}
  </button>;
}

export function ConfirmSubmit({ children, message, tone = "danger" }: {
  children: React.ReactNode; message: string; tone?: "danger" | "secondary";
}) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} onClick={(event) => { if (!window.confirm(message)) event.preventDefault(); }}
    className={`transition-interactive inline-flex min-h-target items-center justify-center rounded-control px-4 py-2 text-caption font-medium disabled:opacity-60 ${tone === "danger"
      ? "border border-red-300 text-red-800 hover:bg-red-50" : "border border-border-control bg-surface hover:border-accent"}`}>
    {pending ? "Working…" : children}
  </button>;
}
