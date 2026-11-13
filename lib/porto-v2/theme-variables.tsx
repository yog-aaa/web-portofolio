import "server-only";

import { getServerFirestore } from "@/lib/firebase/admin";
import { relativeLuminance } from "./color-contrast";

const hex = /^#[0-9a-fA-F]{6}$/;
function onAccent(value: string) {
  return relativeLuminance(value) > 0.179 ? "#171a1c" : "#ffffff";
}

async function getThemeCss() {
  try {
    const doc = await getServerFirestore().collection("site").doc("theme").get();
    const light = doc.data()?.light as Record<string, unknown> | undefined;
    const dark = doc.data()?.dark as Record<string, unknown> | undefined;
    const values = [light?.background, light?.foreground, light?.accent, dark?.background, dark?.foreground, dark?.accent];
    if (!values.every(value => typeof value === "string" && hex.test(value))) return null;
    const [lightBg, lightFg, lightAccent, darkBg, darkFg, darkAccent] = values as string[];
    return `:root{--cms-light-bg:${lightBg};--cms-light-fg:${lightFg};--cms-light-accent:${lightAccent};--cms-light-on-accent:${onAccent(lightAccent)};--cms-dark-bg:${darkBg};--cms-dark-fg:${darkFg};--cms-dark-accent:${darkAccent};--cms-dark-on-accent:${onAccent(darkAccent)}}`;
  } catch {
    return null;
  }
}

export async function ThemeVariables() {
  const css = await getThemeCss();
  return css ? <style dangerouslySetInnerHTML={{__html: css}} /> : null;
}
