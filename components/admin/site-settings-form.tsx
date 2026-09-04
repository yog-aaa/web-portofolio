import { saveSiteSettingsAction } from "@/app/admin/(protected)/settings/actions";
import type { AdminSiteSettings } from "@/lib/domain/settings";
import { AdminActionForm, SubmitButton } from "./admin-action-form";
import { fieldClass, helpClass, labelClass } from "./admin-ui";
import { SocialLinksEditor } from "./social-links-editor";
import { DirectMediaSelect } from "./direct-media-select";
import type { AdminMediaOption } from "@/lib/repositories/admin-content";

const sections = [
  ["selectedWork", "Selected Work"], ["experienceHighlight", "Experience Highlight"],
  ["featuredResearch", "Featured Research"], ["latestThoughts", "Latest Thoughts"],
  ["shortAbout", "Short About"],
] as const;

function Field({ name, label, value, help, multiline = false, required = false }: {
  name: string; label: string; value?: string | null; help?: string; multiline?: boolean; required?: boolean;
}) {
  return <div><label htmlFor={name} className={labelClass}>{label}</label>
    {multiline ? <textarea id={name} name={name} defaultValue={value ?? ""} required={required} rows={4} className={fieldClass} />
      : <input id={name} name={name} defaultValue={value ?? ""} required={required} className={fieldClass} />}
    {help ? <p className={helpClass}>{help}</p> : null}</div>;
}

export function SiteSettingsForm({ settings, media }: { settings: AdminSiteSettings | null; media: AdminMediaOption[] }) {
  const copy = settings?.sectionCopy ?? {};
  return <AdminActionForm action={saveSiteSettingsAction}>
    <input type="hidden" name="expectedUpdatedAt" value={settings?.updatedAt ?? ""} />

    <section aria-labelledby="identity-settings" className="border-t border-border pt-8">
      <h2 id="identity-settings" className="text-h3">Identity and metadata</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Field name="profileDisplayName" label="Profile name" value={settings?.profileDisplayName} required />
        <Field name="brandName" label="Brand display" value={settings?.brandName} required />
        <Field name="siteTitle" label="Site title" value={settings?.siteTitle} />
        <Field name="contentLanguage" label="Content language" value={settings?.contentLanguage ?? "en"} help="Use en, id, or a regional code such as id-ID." required />
        <Field name="location" label="Location" value={settings?.location} />
        <DirectMediaSelect name="portraitMediaId" label="Primary portrait" category="profile" options={media}
          selected={settings?.portraitMediaId} help="Select an existing profile image or upload one here. Square and 3:4 portraits keep their natural ratio." />
        <div className="md:col-span-2"><Field name="defaultSeoDescription" label="Default SEO description" value={settings?.defaultSeoDescription} multiline /></div>
      </div>
    </section>

    <section aria-labelledby="hero-settings" className="border-t border-border pt-8">
      <h2 id="hero-settings" className="text-h3">Homepage hero</h2>
      <div className="mt-6 grid gap-6">
        <Field name="heroEyebrow" label="Hero eyebrow" value={settings?.heroEyebrow} help="Short positioning line above the headline." />
        <Field name="heroHeadline" label="Hero headline" value={settings?.heroHeadline} multiline />
        <Field name="heroDescription" label="Hero description" value={settings?.heroDescription} multiline />
        <Field name="heroExploreLabel" label="Explore link label" value={settings?.heroExploreLabel} />
      </div>
    </section>

    <section aria-labelledby="section-copy-settings" className="border-t border-border pt-8">
      <h2 id="section-copy-settings" className="text-h3">Homepage section copy</h2>
      <p className={helpClass}>Empty headings hide their corresponding homepage section.</p>
      <div className="mt-6 space-y-8">{sections.map(([key, label]) => {
        const item = copy[key];
        return <fieldset key={key} className="grid gap-5 border-l border-border pl-5 md:grid-cols-2">
          <legend className="type-metadata mb-4 text-foreground-secondary">{label.toUpperCase()}</legend>
          <Field name={`${key}Heading`} label="Heading" value={item?.heading} />
          <Field name={`${key}ActionLabel`} label="Action label" value={item?.actionLabel} />
          <div className="md:col-span-2"><Field name={`${key}Intro`} label="Introduction" value={item?.intro} multiline /></div>
        </fieldset>;
      })}</div>
    </section>

    <section aria-labelledby="contact-settings" className="border-t border-border pt-8">
      <h2 id="contact-settings" className="text-h3">Contact and footer</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Field name="contactSectionHeading" label="Contact section label" value={copy.contact?.heading} />
        <Field name="contactEmail" label="Contact email" value={settings?.contactEmail} help="Stored as a server-managed mailto link; never inferred." />
        <Field name="contactHeading" label="Contact heading" value={settings?.contactHeading} multiline />
        <Field name="contactLabel" label="Contact action label" value={settings?.contactLabel} />
        <div className="md:col-span-2"><Field name="contactText" label="Contact supporting text" value={settings?.contactText} multiline /></div>
        <div className="md:col-span-2"><SocialLinksEditor initialLinks={settings?.socialLinks ?? []} /></div>
        <div className="md:col-span-2"><Field name="footerContent" label="Footer content" value={settings?.footerContent} multiline /></div>
      </div>
    </section>

    <div className="sticky bottom-4 flex justify-end border border-border bg-surface/95 p-4 shadow-sm backdrop-blur"><SubmitButton>Save site settings</SubmitButton></div>
  </AdminActionForm>;
}
