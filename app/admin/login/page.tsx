import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/porto-v2/interactions";
import { LoginForm } from "./login-form";
import "@/components/porto-v2/landing.css";
import "@/components/admin/cms-v2.css";

export const metadata: Metadata = { title: "Owner sign in" };
export default function LoginPage() {
  return <main className="porto-v2 cms-login"><header><Link href="/" className="v2-brand"><Image src="/porto-v2/yogaaa-mark.png" alt="" width={24} height={24} /> YOGAAA.</Link><ThemeToggle /></header><div className="cms-login-body"><div><p className="v2-eyebrow">PRIVATE WORKSPACE</p><h1>Make it<br />yours.</h1><p>Sign in to manage the work, writing, and story behind this portfolio.</p></div><section aria-labelledby="sign-in-heading"><p className="v2-eyebrow">OWNER ACCESS</p><h2 id="sign-in-heading">Welcome back.</h2><LoginForm /></section></div><footer><Link href="/">← BACK TO THE WEBSITE</Link></footer></main>;
}
