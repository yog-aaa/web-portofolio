"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";

const appName = "portfolio-owner";

function getClientApp() {
  const existing = getApps().find((app) => app.name === appName);
  if (existing) return getApp(appName);

  return initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }, appName);
}

/** The browser holds credentials only during the sign-in or account-link flow. */
export async function getOwnerClientAuth() {
  const auth = getAuth(getClientApp());
  await setPersistence(auth, inMemoryPersistence);
  return auth;
}
