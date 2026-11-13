"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { GoogleAuthProvider, linkWithPopup, signInWithEmailAndPassword, signOut, unlink, type Auth, type User } from "firebase/auth";
import { getOwnerClientAuth } from "@/lib/firebase/client";

function linkError(error: unknown) {
  if (error instanceof FirebaseError) {
    if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(error.code)) return "Password is incorrect. Try again.";
    if (error.code === "auth/credential-already-in-use") return "This Google account is already linked to another Firebase user. Check the users in Firebase Console before trying again.";
    if (error.code === "auth/account-exists-with-different-credential") return "This Google account belongs to a different Firebase user. Choose the owner Google account.";
    if (error.code === "auth/unauthorized-domain") return "Add this website to Firebase Authentication authorized domains, then try again.";
    if (error.code === "auth/popup-blocked") return "Allow pop-ups for this site, then try again.";
    if (error.code === "auth/popup-closed-by-user") return "Google connection was cancelled. You can try again.";
    if (error.code === "auth/network-request-failed") return "Could not reach Firebase Authentication. Check your connection and try again.";
    if (error.code === "auth/provider-already-linked") return "Google is already connected. Refresh this page to see its status.";
    if (error.code === "auth/too-many-requests") return "Too many attempts. Please try again later.";
  }
  return error instanceof Error && !error.message.startsWith("Firebase:") ? error.message : "Could not connect Google. Please try again.";
}

export function GoogleAccountLinker({ email, ownerUid }: { email: string; ownerUid: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pending, setPending] = useState<"verify" | "link" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const authRef = useRef<Auth | null>(null);

  useEffect(() => () => { if (authRef.current) void signOut(authRef.current).catch(() => {}); }, []);
  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      if (authRef.current) void signOut(authRef.current).catch(() => {});
      setUser(null);
      setError("Password confirmation expired. Confirm it again to continue.");
    }, 5 * 60 * 1000);
    return () => window.clearTimeout(timer);
  }, [user]);

  async function verifyPassword(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const password = String(new FormData(form).get("password") ?? "");
    form.reset();
    setPending("verify");
    setError("");
    setSuccess("");
    try {
      const auth = await getOwnerClientAuth();
      authRef.current = auth;
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user.uid !== ownerUid) {
        await signOut(auth);
        throw new Error("This password belongs to a different account. No account was linked.");
      }
      setUser(result.user);
    } catch (cause) {
      if (authRef.current) await signOut(authRef.current).catch(() => {});
      setError(linkError(cause));
    } finally {
      setPending(null);
    }
  }

  async function connectGoogle() {
    if (!user || pending) return;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ login_hint: email, prompt: "select_account" });
    setPending("link");
    setError("");
    try {
      // Open the popup from this click; a preceding async password check can lose the browser's user gesture.
      const result = await linkWithPopup(user, provider);
      if (result.user.uid !== ownerUid) throw new Error("The owner account did not match. Check Firebase Console.");
      const googleEmail = result.user.providerData.find(item => item.providerId === "google.com")?.email;
      if (googleEmail?.toLowerCase() !== email.toLowerCase()) {
        try {
          await unlink(result.user, "google.com");
        } catch {
          throw new Error("The Google email did not match. Check linked providers in Firebase Console before trying again.");
        }
        throw new Error(`Choose the Google account for ${email}. The other account was not kept linked.`);
      }
      if (authRef.current) await signOut(authRef.current);
      authRef.current = null;
      setUser(null);
      setSuccess("Google is connected. You can now sign in with either method.");
      router.refresh();
    } catch (cause) {
      setError(linkError(cause));
    } finally {
      setPending(null);
    }
  }

  return <div className="cms-account-linker">
    <p className="cms-account-kicker">CONNECT GOOGLE</p>
    <h3>{user ? "Choose your Google account." : "Confirm your password first."}</h3>
    <p>Use the Google account with <strong>{email}</strong>. It will be linked to your existing owner UID.</p>
    {!user ? <form method="post" action="/admin/settings/account" onSubmit={verifyPassword} aria-busy={pending === "verify"}>
      <label htmlFor="account-current-password">Current password</label>
      <input id="account-current-password" name="password" type="password" autoComplete="current-password" required disabled={Boolean(pending)} />
      <button type="submit" disabled={Boolean(pending)}>{pending === "verify" ? "VERIFYING…" : "CONFIRM PASSWORD ↗"}</button>
    </form> : <button type="button" onClick={() => void connectGoogle()} disabled={Boolean(pending)}>
      {pending === "link" ? "CONNECTING…" : "CONNECT GOOGLE ACCOUNT ↗"}
    </button>}
    {error && <p className="cms-account-feedback" role="alert" data-error>{error}</p>}
    {success && <p className="cms-account-feedback" role="status">{success}</p>}
  </div>;
}
