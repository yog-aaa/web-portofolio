"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);

  async function signIn(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const result = await authClient.signIn.email({
        email: String(data.get("email") ?? "").trim(),
        password: String(data.get("password") ?? ""),
      });
      if (result.error) {
        setError(result.error.status === 429 ? "Too many attempts. Please wait a minute and try again." :
          result.error.status >= 500 ? "Sign in is temporarily unavailable. Please try again." : "Email or password is incorrect.");
      } else {
        router.replace("/admin");
        router.refresh();
        return;
      }
    } catch {
      setError("Could not connect. Check your connection and try again.");
    }
    const password = form.elements.namedItem("password");
    if (password instanceof HTMLInputElement) password.value = "";
    setPending(false);
    requestAnimationFrame(() => errorRef.current?.focus());
  }

  return (
    <form onSubmit={signIn} className="space-y-6" aria-busy={pending}>
      <div>
        <label htmlFor="email" className="mb-2 block text-caption font-medium">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false}
          required maxLength={254} className="min-h-target w-full rounded-control border border-border-control bg-surface px-3 text-body" />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-caption font-medium">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={128}
          className="min-h-target w-full rounded-control border border-border-control bg-surface px-3 text-body" />
      </div>
      <p ref={errorRef} tabIndex={-1} role="alert" className="text-caption text-foreground">{error}</p>
      <button type="submit" disabled={pending}
        className="transition-interactive min-h-target w-full rounded-control bg-accent px-5 py-3 font-medium text-accent-foreground hover:bg-accent-deep disabled:cursor-wait disabled:opacity-60">
        {pending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
