import "server-only";

import { getServerFirestore } from "@/lib/firebase/admin";

const hex = /^#[0-9a-fA-F]{6}$/;
function luminance(value: string) {
  const channels = [1, 3, 5].map(index => parseInt(value.slice(index, index + 2), 16) / 255)
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
function onAccent(value: string) {
  return luminance(value) > 0.179 ? "#171a1c" : "#ffffff";
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
