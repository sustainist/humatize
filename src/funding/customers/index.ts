import { writable } from "svelte/store";

export const showYourContributions = writable(localStorage.getItem("Show Your Contributions") === "true");
showYourContributions.subscribe((value) => {
    localStorage.setItem("Show Your Contributions", value.toString());
});