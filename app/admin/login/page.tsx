import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Owner sign in" };

export default function LoginPage() {
  return (
    <main className="container-site flex min-h-svh flex-col py-8 md:py-12">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <Link href="/" className="text-h3 font-medium tracking-tight">YOGAAA.</Link>
        <span className="type-metadata text-foreground-secondary">OWNER ACCESS</span>
      </header>
      <div className="grid flex-1 items-center gap-12 py-section md:grid-cols-2 md:gap-16">
        <div className="max-w-reading">
          <p className="type-metadata mb-5 text-foreground-secondary">PRIVATE WORKSPACE</p>
          <h1 className="text-h1">A space to<br />make it yours.</h1>
          <p className="mt-6 max-w-sm text-body-lg text-foreground-secondary">Sign in to your personal publishing space.</p>
        </div>
        <section aria-labelledby="sign-in-heading" className="w-full max-w-form md:justify-self-end">
          <h2 id="sign-in-heading" className="text-h3">Owner sign in</h2>
          <p className="mt-2 mb-8 text-caption text-foreground-secondary">Use your owner email and password.</p>
          <LoginForm />
        </section>
      </div>
      <footer className="border-t border-border pt-6 text-caption text-foreground-secondary">
        <Link className="inline-flex min-h-target items-center underline underline-offset-4" href="/">← Back to the website</Link>
      </footer>
    </main>
  );
}
