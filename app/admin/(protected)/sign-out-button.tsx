"use client";

import { useState } from "react";

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/owner-session", { method: "DELETE", credentials: "same-origin" });
      if (!response.ok) throw new Error();
      window.location.replace("/admin/login");
    } catch {
      setError("Could not sign out. Please try again.");
      setPending(false);
    }
  }

  return <div className="text-right">
    <button type="button" onClick={signOut} disabled={pending} className="min-h-target px-3 text-caption underline underline-offset-4 disabled:opacity-60">
      {pending ? "Signing out…" : "Sign out"}
    </button>
    <p role="alert" className="text-caption">{error}</p>
  </div>;
}
