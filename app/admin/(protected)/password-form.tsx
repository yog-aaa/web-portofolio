"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export function PasswordForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function changePassword(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const newPassword = String(data.get("newPassword") ?? "");
    if (newPassword !== data.get("confirmation")) {
      setMessage("New passwords do not match.");
      return;
    }
    setPending(true);
    setMessage("");
    try {
      const result = await authClient.changePassword({
        currentPassword: String(data.get("currentPassword") ?? ""), newPassword, revokeOtherSessions: true,
      });
      if (result.error?.status === 401) {
        window.location.replace("/admin/login");
        return;
      }
      setMessage(result.error ? result.error.status === 429 ? "Too many attempts. Please wait a minute." :
        "Could not change password. Check your current password and try again." : "Password updated. Other sessions have been signed out.");
      if (!result.error) form.reset();
    } catch {
      setMessage("Could not connect. Please try again.");
    }
    setPending(false);
  }
  return <form onSubmit={changePassword} className="space-y-5" aria-busy={pending}>
    {[
      ["currentPassword", "Current password", "current-password"],
      ["newPassword", "New password", "new-password"],
      ["confirmation", "Confirm new password", "new-password"],
    ].map(([name, label, autoComplete]) => <div key={name}>
      <label htmlFor={name} className="mb-2 block text-caption font-medium">{label}</label>
      <input id={name} name={name} type="password" autoComplete={autoComplete} required
        minLength={name === "currentPassword" ? 1 : 12} maxLength={128}
        className="min-h-target w-full rounded-control border border-border-control bg-surface px-3 text-body" />
    </div>)}
    <p role="status" className="text-caption">{message}</p>
    <button type="submit" disabled={pending} className="transition-interactive min-h-target rounded-control bg-accent px-5 py-3 text-accent-foreground hover:bg-accent-deep disabled:opacity-60">
      {pending ? "Updating…" : "Update password"}
    </button>
  </form>;
}
