import { addShares, type Distribution } from "../../sustainableDistribution";

export const getBackers = (participants: Distribution["participants"], mrp: { nrOfPeople: number, mrp: number, timestamp: string | number }) => {

    let sumOfPrevPledges: number = 0;
    const updatedParticipants: Distribution["participants"] = [];

    [{
        nrOfPeople: mrp.nrOfPeople,
        pledge: mrp.mrp,
        timestamp: mrp.timestamp
    }, ...participants].forEach((participant, index) => {
        if (participant && typeof participant.pledge === "number") {
            const participantClone = {
                ...participant,
                rewardBacker: 0,
            };
            const currentPledgeToShare = participantClone.pledge || 0;

            let prevSum = 0;
            for (
                let index1 = 0;
                index1 < updatedParticipants.length;
                index1++
            ) {
                const pledge1 = updatedParticipants[index1]?.pledge || 0;

                const startPosition = prevSum + 1;
                const endPosition = prevSum + pledge1;

                const sharesForPrevSum = addShares({
                    profit: currentPledgeToShare,
                    participants: sumOfPrevPledges,
                    startPosition,
                    endPosition,
                });

                updatedParticipants[index1]!.rewardBacker =
                    (updatedParticipants[index1]!.rewardBacker || 0) +
                    sharesForPrevSum;

                prevSum += pledge1;
            }

            sumOfPrevPledges += participantClone.pledge || 0;

            updatedParticipants.push(participantClone);
        }
    });
    return updatedParticipants;
};

export function customersToBackers(customers: Customer[]): Distribution["participants"] {
    const participants: Distribution["participants"] = []
    customers.forEach((customer, i) => {
        const participant: Distribution['participants'][0] = {
            pledge: (customer.amount || 0) / 100,
            nrOfPeople: 1,
            timestamp: customer.created * 1000
        }
        participants.push(participant)
    })
    return participants
}
