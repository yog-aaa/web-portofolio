import "server-only";

import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const appName = "portfolio-server";

function getServerApp(): App {
  const existing = getApps().find((app) => app.name === appName);
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) throw new Error("FIREBASE_PROJECT_ID is required.");

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replaceAll("\\n", "\n");
  if (Boolean(clientEmail) !== Boolean(privateKey)) {
    throw new Error("Firebase Admin credentials must be provided as a pair.");
  }
  const authEmulator = Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);
  const firestoreEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  if (authEmulator !== firestoreEmulator) {
    throw new Error("Both Firebase emulators must be configured together.");
  }
  const emulator = authEmulator && firestoreEmulator;

  if (!emulator && (!clientEmail || !privateKey) && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error("Firebase Admin credentials are required outside the emulators.");
  }

  return initializeApp({
    projectId,
    ...(clientEmail && privateKey
      ? { credential: cert({ projectId, clientEmail, privateKey }) }
      : !emulator ? { credential: applicationDefault() } : {}),
  }, appName);
}

export function getServerAuth() {
  return getAuth(getServerApp());
}

export function getServerFirestore() {
  return getFirestore(getServerApp());
}
