import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/porto-v2/interactions";
import { LoginForm } from "./login-form";
import "@/components/porto-v2/landing.css";
import "@/components/admin/cms-v2.css";

export const metadata: Metadata = { title: "Owner sign in" };

export default function LoginPage() {
  return <main className="porto-v2 cms-login">
    <header className="cms-login-header">
      <Link href="/" className="v2-brand">
        <Image src="/porto-v2/yogaaa-mark.png" alt="" width={24} height={24} />
        YOGAAA.
      </Link>
      <ThemeToggle />
    </header>

    <div className="cms-login-body">
      <div className="cms-login-intro">
        <p className="v2-eyebrow">YOGAAA. / CONTENT STUDIO</p>
        <h1>Back to<br />the work.</h1>
        <p>Your private workspace for keeping the portfolio current.</p>
        <span className="cms-login-intro-line" aria-hidden="true" />
      </div>

      <section className="cms-login-panel" aria-labelledby="sign-in-heading">
        <p className="v2-eyebrow">OWNER ACCESS</p>
        <h2 id="sign-in-heading">Sign in.</h2>
        <p className="cms-login-panel-note">Use your owner account to continue.</p>
        <LoginForm />
      </section>
    </div>

    <footer className="cms-login-footer">
      <Link href="/">← BACK TO THE WEBSITE</Link>
      <span>YOGAAA. / PORTO V2</span>
    </footer>
  </main>;
}
