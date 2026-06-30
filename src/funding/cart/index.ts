import { get, writable } from "svelte/store";
import { user } from "../../firebase";
import { currencies, jsonParse, showFormCheckout } from "..";

export const makeId = (() => {
    let id = 1;
    return () => id++;
})();

export const formId = writable('');


// open
export const open = writable(localStorage.getItem("funding open") === "true");
open.subscribe((value) => {
    localStorage.setItem("funding open", value.toString());
});

// email
export const email = writable(localStorage.getItem(`email`) || '');

email.subscribe((value) => {
    localStorage.setItem(`email`, value);
    showFormCheckout.set(null);
});

user.subscribe((usr) => {
    if (usr?.email) {
        email.set(usr.email);
    }
});

// destination
export const destination = writable(
    localStorage.getItem(`selected destination for ${formId}`) ||
    "",
);
destination.subscribe((value) => {
    localStorage.setItem(`selected destination for ${formId}`, value);
    showFormCheckout.set(null);
    if (!value) {
        destination.set(document.title);
    }
});

// currency
export const currency = writable<{ code: string; symbol: string } | null>(
    jsonParse(
        localStorage.getItem(`selected currency for ${formId}`),
        null,
    )[1] as { code: string; symbol: string } | null,
);
currency.subscribe((value) => {
    localStorage.setItem(
        `selected currency for ${formId}`,
        JSON.stringify(value),
    );
    showFormCheckout.set(null);
});
currencies.subscribe((value) => {
    if (!value.length) return;
    const current = get(currency);
    if (!current) {
        currency.set({
            code: value[0]?.code || "eur",
            symbol: value[0]?.symbol || "€",
        });
    }
})

// amount
export const amount = writable(
    +(localStorage.getItem(`selected amount for ${formId}`) || "null") || 8,
);
amount.subscribe((value) => {
    localStorage.setItem(`selected amount for ${formId}`, "" + value);
    showFormCheckout.set(null);
});

// recurring
export const interval = writable<"month" | "one-time">(
    (<["month", "one-time"]>["month", "one-time"]).find(
        (i) => i === localStorage.getItem(`selected interval for ${formId}`),
    ) || "month",
);
interval.subscribe((value) => {
    localStorage.setItem(`selected interval for ${formId}`, value);
    showFormCheckout.set(null);
});
