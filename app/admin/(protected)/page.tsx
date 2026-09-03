import { requireOwnerPage } from "@/lib/auth/require-owner";
import { PasswordForm } from "./password-form";

export default async function OwnerPage() {
  const owner = await requireOwnerPage();
  return (
    <main className="py-section">
      <p className="type-metadata mb-4 text-foreground-secondary">PRIVATE WORKSPACE</p>
      <h1 className="text-h2">Welcome, {owner.name}.</h1>
      <p className="mt-4 max-w-reading text-body text-foreground-secondary">You’re signed in as Owner. Content management tools are being prepared.</p>
      <section aria-labelledby="password-heading" className="mt-12 max-w-form border-t border-border pt-8">
        <h2 id="password-heading" className="text-h3">Change password</h2>
        <p className="mt-2 mb-6 text-caption text-foreground-secondary">Replace your temporary password after your first sign in. Use at least 12 characters.</p>
        <PasswordForm />
      </section>
    </main>
  );
}
