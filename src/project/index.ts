import { writable } from "svelte/store"

export const goal = writable(1000)

export const roundNumbersCreators = writable(/* localStorage.getItem("rounded creators") !== "false" */true)
/* roundedCreators.subscribe((value) => {
    localStorage.setItem("rounded creators", '' + value)
}) */

export const roundNumbersBackers = writable(/* localStorage.getItem("rounded backers") !== "false" */true)
/* roundNumbersBackers.subscribe((value) => {
    localStorage.setItem("rounded backers", '' + value)
}) */