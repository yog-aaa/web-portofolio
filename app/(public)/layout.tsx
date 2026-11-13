import { ThemeVariables } from "@/lib/porto-v2/theme-variables";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const theme = await ThemeVariables();
  return <>{theme}{children}</>;
}
