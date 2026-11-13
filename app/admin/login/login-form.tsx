"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider, linkWithPopup, signInWithEmailAndPassword,
  signInWithPopup, signOut,
} from "firebase/auth";
import { getOwnerClientAuth } from "@/lib/firebase/client";

function loginError(error: unknown) {
  if (error instanceof FirebaseError) {
    if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(error.code)) {
      return "Email or password is incorrect.";
    }
    if (error.code === "auth/unauthorized-domain") return "Add this site to Firebase Authentication authorized domains.";
    if (error.code === "auth/network-request-failed") return "Could not reach Firebase Authentication. Check your connection or browser blocking, then try again.";
    if (error.code === "auth/popup-closed-by-user") return "Google sign-in was cancelled.";
    if (error.code === "auth/popup-blocked") return "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.";
    if (error.code === "auth/credential-already-in-use") return "That Google account belongs to another Firebase user. Check the linked providers in Firebase Console.";
    if (error.code === "auth/account-exists-with-different-credential") return "Sign in with your email and password, then select Link Google account.";
    if (error.code === "auth/too-many-requests") return "Too many attempts. Please try again later.";
    return "Sign-in could not be completed. Please try again.";
  }
  return error instanceof Error && error.message && !error.message.startsWith("Firebase:")
    ? error.message : "Could not sign in. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);

  async function createOwnerSession(idToken: string) {
    const response = await fetch("/api/owner-session", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.message || "Owner access is temporarily unavailable.");
    }
  }

  async function runSignIn(action: () => Promise<string>) {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const idToken = await action();
      await createOwnerSession(idToken);
      await signOut(await getOwnerClientAuth());
      router.replace("/admin");
      router.refresh();
    } catch (cause) {
      setError(loginError(cause));
      const auth = await getOwnerClientAuth().catch(() => null);
      if (auth) await signOut(auth).catch(() => {});
      setPending(false);
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  function onEmail(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void runSignIn(async () => {
      const auth = await getOwnerClientAuth();
      const user = (await signInWithEmailAndPassword(
        auth, String(data.get("email") ?? "").trim(), String(data.get("password") ?? ""),
      )).user;
      if (data.get("linkGoogle") === "on" && !user.providerData.some(provider => provider.providerId === "google.com")) {
        await linkWithPopup(user, new GoogleAuthProvider());
      }
      return user.getIdToken(true);
    });
    const password = event.currentTarget.elements.namedItem("password");
    if (password instanceof HTMLInputElement) password.value = "";
  }

  return <div className="cms-login-controls">
    <p ref={errorRef} tabIndex={-1} role="alert" className="cms-login-error">{error}</p>
    {/* Native POST keeps credentials out of the URL if hydration has not finished. */}
    <form method="post" action="/admin/login" onSubmit={onEmail} className="cms-login-form" aria-busy={pending}>
      <div className="cms-login-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false}
          required maxLength={254} />
      </div>
      <div className="cms-login-field">
        <label htmlFor="password">Password</label>
        <div className="cms-login-password">
          <input id="password" name="password" type={showPassword ? "text" : "password"}
            autoComplete="current-password" required maxLength={4096} />
          <button type="button" onClick={() => setShowPassword(value => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}>{showPassword ? "HIDE" : "SHOW"}</button>
        </div>
      </div>
      <details className="cms-login-link">
        <summary>First time using Google?</summary>
        <p>Sign in with email once and link Google to this same account.</p>
        <label><input name="linkGoogle" type="checkbox" /> Link Google during this sign-in</label>
      </details>
      <button type="submit" disabled={pending} className="cms-login-submit">
        {pending ? "Signing in…" : "Sign in with email"}<span aria-hidden="true">↗</span>
      </button>
    </form>
    <div className="cms-login-divider"><span>or</span></div>
    <button type="button" disabled={pending} onClick={() => void runSignIn(async () => {
      const auth = await getOwnerClientAuth();
      const user = (await signInWithPopup(auth, new GoogleAuthProvider())).user;
      return user.getIdToken(true);
    })} className="cms-login-google">
      <span aria-hidden="true">G</span>
      Continue with Google
    </button>
    <p className="cms-login-footnote">Access is limited to the portfolio owner.</p>
  </div>;
}
