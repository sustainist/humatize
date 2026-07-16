import { writable } from "svelte/store"
import { getReferencePoint } from "../sustainableDistribution";

export const initMRP = { nrOfPeople: 5, position: 1, participants: 2, mrp: 100, timestamp: '7/16/26, 12:00 AM' }


// 5 performers
const buildGoalLevel0 = () => {
    const ref = getReferencePoint({
        share: initMRP.mrp * initMRP.nrOfPeople,
        position: initMRP.position,
        participants: initMRP.participants,
    });
    return ref
}
const buildGoal = () => {
    const ref2 = getReferencePoint({
        share: buildGoalLevel0(),
        position: 1,
        participants: 4,
    });
    return ref2;
};

export const mrp = writable(initMRP.mrp)
export const goal = writable(buildGoal())

export const roundNumbersCreators = writable(/* localStorage.getItem("rounded creators") !== "false" */true)
/* roundedCreators.subscribe((value) => {
    localStorage.setItem("rounded creators", '' + value)
}) */

export const roundNumbersBackers = writable(/* localStorage.getItem("rounded backers") !== "false" */true)
/* roundNumbersBackers.subscribe((value) => {
    localStorage.setItem("rounded backers", '' + value)
}) */

export const simulateMRP = writable(initMRP.mrp)
export const simulateGoal = writable(buildGoalLevel0())