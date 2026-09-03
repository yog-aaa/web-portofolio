"use client";

import { createAuthClient } from "better-auth/react";

// Same-origin HTTP requests retain Better Auth's rate limiting and CSRF protection.
export const authClient = createAuthClient();
