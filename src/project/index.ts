import { writable } from "svelte/store"
import { getReferencePoint } from "../sustainableDistribution";
import creatorsParticipants from "./creators/participants.json";

interface ParticipantNode {
    id: number;
    text: string;
    parent: number;
    marketReferencePoint?: boolean;
    nrOfPeople?: number;
}

const mrpNode = (creatorsParticipants as ParticipantNode[]).find(p => p.marketReferencePoint === true) || { parent: 0, nrOfPeople: 1, id: 1, marketReferencePoint: true, text: '' };

if (!mrpNode) {
    throw new Error("Market reference point node not found in participants.json");
}

const parentId = mrpNode.parent;
const mrpSiblings = (creatorsParticipants as ParticipantNode[]).filter(p => p.parent === parentId);
const mrpPosition = mrpSiblings.findIndex(s => s.id === mrpNode.id) + 1;
const mrpParticipantsCount = mrpSiblings.length;

export const initMRP = {
    nrOfPeople: mrpNode.nrOfPeople || 10,
    position: mrpPosition,
    participants: mrpParticipantsCount,
    mrp: 100,
    timestamp: '7/16/26, 12:00 AM'
};

export const buildGoalLevel0 = (mrpValue: number = initMRP.mrp) => {
    return getReferencePoint({
        share: mrpValue * initMRP.nrOfPeople,
        position: initMRP.position,
        participants: initMRP.participants,
    });
};

export const calculateGoal = (mrpValue: number): number => {
    let currentShare = mrpValue * (mrpNode.nrOfPeople || 1);
    let currentNode: ParticipantNode | undefined = mrpNode;

    while (currentNode) {
        const curr: ParticipantNode = currentNode;
        const siblings = (creatorsParticipants as ParticipantNode[]).filter(p => p.parent === curr.parent);
        const position = siblings.findIndex(s => s.id === curr.id) + 1;
        const participantsCount = siblings.length;

        currentShare = getReferencePoint({
            share: currentShare,
            position,
            participants: participantsCount
        });

        if (curr.parent === 0) {
            break;
        }

        currentNode = (creatorsParticipants as ParticipantNode[]).find(p => p.id === curr.parent);
    }

    return currentShare;
};

export const mrp = writable(initMRP.mrp);
// export const goal = writable(calculateGoal(initMRP.mrp));
export const goal = writable(2000);

export const roundNumbersCreators = writable(/* localStorage.getItem("rounded creators") !== "false" */true)
/* roundedCreators.subscribe((value) => {
    localStorage.setItem("rounded creators", '' + value)
}) */

export const roundNumbersBackers = writable(/* localStorage.getItem("rounded backers") !== "false" */true)
/* roundNumbersBackers.subscribe((value) => {
    localStorage.setItem("rounded backers", '' + value)
}) */

export const simulateMRP = writable(initMRP.mrp);
export const simulateGoal = writable(buildGoalLevel0(initMRP.mrp));

export function harmonicSplit(n = 20): {position: number,percent: number}[] {
    let H = 0;
    for (let i = 1; i <= n; i++) H += 1 / i;
    const table: {position: number,percent: number}[] = [];
    for (let i = 1; i <= n; i++) {
        const percent = (1 / i) / H;
        table.push({
            position: i,
            percent: percent
        });
    }
    return table;
}