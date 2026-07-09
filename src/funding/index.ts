import { writable } from "svelte/store";
import { user } from "../firebase";

export function jsonParse<T>(json: any, defaultValue: T): [unknown, T] {
  try {
    return [null, JSON.parse(json || "" + defaultValue) as T];
  } catch (e) {
    return [e instanceof Error ? e.message : e, defaultValue];
  }
}

export const accountCustomers = writable<Customer[] | null>(null);
user.subscribe((user) => {
  if (!user) {
    accountCustomers.set(null);
  }
});

export const allCustomers = writable<Customer[] | null>(null);


export const showFormCheckout = writable<string | null>(null);

export const showCart = writable<boolean>(localStorage.getItem("Show Cart") !== "false");
showCart.subscribe((value) => {
  localStorage.setItem("Show Cart", value.toString());
});

export const currencies = writable<
  { code: string; symbol: string; currency: string }[]
>([]);

export function formatCurrency(code: string, locale = "en") {
  const upperCode = code.toUpperCase().trim();
  try {
    // Get currency name
    const name = new Intl.DisplayNames([locale], {
      type: "currency",
    }).of(upperCode);

    // Get currency symbol
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: upperCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    const parts = formatter.formatToParts(1);
    const symbol =
      parts.find((part) => part.type === "currency")?.value || upperCode;

    return { symbol, currency: `${upperCode} - ${name} (${symbol})` };
  } catch (e) {
    return { symbol: "", currency: `Invalid currency code: ${code}` };
  }
}

export function formatDate(isoString?: string | number): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yy}-${mm}-${dd} ${hh}:${min}`;
}
