import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { GoogleAccountLinker } from "@/components/admin/google-account-linker";
import { requireOwnerPage } from "@/lib/auth/require-owner";
import { getServerAuth } from "@/lib/firebase/admin";

export default async function AccountPage() {
  const owner = await requireOwnerPage();
  const user = await getServerAuth().getUser(owner.id);
  const email = user.email ?? owner.email;
  const google = user.providerData.find(provider => provider.providerId === "google.com");
  const password = user.providerData.some(provider => provider.providerId === "password");

  return <main className="cms-account-page">
    <AdminPageHeader eyebrow="SETTINGS / ACCOUNT" title="Account access"
      description="Choose how you sign in to this owner workspace. Both methods must belong to the same Firebase account." />
    <nav className="cms-account-tabs" aria-label="Settings sections">
      <Link href="/admin/settings/theme">Appearance</Link>
      <Link href="/admin/settings/account" aria-current="page">Account access</Link>
    </nav>
    <section className="cms-account-panel" aria-labelledby="sign-in-methods">
      <div className="cms-account-panel-intro">
        <p className="cms-account-kicker">OWNER IDENTITY</p>
        <h2 id="sign-in-methods">Sign-in methods</h2>
        <p>{email}</p>
      </div>
      <div className="cms-account-provider">
        <div><strong>Email &amp; password</strong><span>Your existing way to sign in.</span></div>
        <span className="cms-account-state" data-connected={password}>{password ? "CONNECTED" : "NOT CONNECTED"}</span>
      </div>
      <div className="cms-account-provider">
        <div><strong>Google</strong><span>{google ? `Connected as ${google.email ?? email}` : "Use Google to sign in to this same owner account."}</span></div>
        <span className="cms-account-state" data-connected={Boolean(google)}>{google ? "CONNECTED" : "NOT CONNECTED"}</span>
      </div>
      {!google && password && email && <GoogleAccountLinker email={email} ownerUid={owner.id} />}
    </section>
  </main>;
}
