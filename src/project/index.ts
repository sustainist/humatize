import { writable } from "svelte/store"

export const goal = writable(1000)

export const roundedCreators = writable(/* localStorage.getItem("rounded creators") !== "false" */true)
/* roundedCreators.subscribe((value) => {
    localStorage.setItem("rounded creators", '' + value)
}) */