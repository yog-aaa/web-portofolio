import Link from "next/link";
import { requireOwnerPage } from "@/lib/auth/require-owner";
import { SignOutButton } from "./sign-out-button";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  await requireOwnerPage();
  return (
    <div className="container-site min-h-svh py-8 md:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <Link href="/admin" className="text-h3 font-medium tracking-tight">YOGAAA. <span className="type-metadata ml-2 text-foreground-secondary">OWNER</span></Link>
        <SignOutButton />
      </header>
      {children}
    </div>
  );
}
