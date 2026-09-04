import type { PreciseDate } from "@/lib/domain/content-values";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatPreciseDate(value: PreciseDate | null): string | null {
  if (!value) return null;
  const [year, month, day] = value.split("-");
  if (!month) return year;
  const monthName = months[Number(month) - 1];
  if (!monthName) return value;
  return day ? `${day} ${monthName} ${year}` : `${monthName} ${year}`;
}

export function formatDateRange(start: PreciseDate | null, end: PreciseDate | null, current = false) {
  const from = formatPreciseDate(start);
  const to = current ? "Present" : formatPreciseDate(end);
  if (from && to) return `${from} — ${to}`;
  return from ?? to;
}

export function normalizeLabel(value: string) {
  return value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function uniqueByKey<T extends { key: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.key, item])).values()];
}

export function formatDecimal(value: string) {
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : value;
}

export function isSafeExternalHref(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
