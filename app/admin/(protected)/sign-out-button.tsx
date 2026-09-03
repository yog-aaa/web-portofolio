"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function signOut() {
    setPending(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (!result.error || result.error.status === 401) {
        window.location.replace("/admin/login");
        return;
      }
    } catch { /* Report a safe message without logging the provider response. */ }
    setError("Could not sign out. Please try again.");
    setPending(false);
  }
  return <div className="text-right">
    <button type="button" onClick={signOut} disabled={pending} className="min-h-target px-3 text-caption underline underline-offset-4 disabled:opacity-60">
      {pending ? "Signing out…" : "Sign out"}
    </button>
    <p role="alert" className="text-caption">{error}</p>
  </div>;
}
