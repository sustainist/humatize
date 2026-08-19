import { type Distribution } from "../../sustainableDistribution/distributionTautochroneCurve";
import { addShares } from "../../sustainableDistribution/distributionZipfLaw";

export const getBackers = (participants: Distribution["participants"], exponent: number): Distribution['participants'] => {

    let sumOfPrevPledges: number = 0;
    const updatedParticipants: Distribution["participants"] = [];

    participants.forEach((participant, index) => {
        if (participant && typeof participant.pledge === "number") {
            const currentPledgeToShare = participant.pledge || 0;
            const participantClone = {
                ...participant,
                rewardBacker: 0,
                percentageBacker: 0,
                distributionStart: sumOfPrevPledges + 1,
                distributionEnd: sumOfPrevPledges + currentPledgeToShare,
            };

            let prevSum = 0;
            for (
                let index1 = 0;
                index1 < updatedParticipants.length;
                index1++
            ) {
                const pledge1 = updatedParticipants[index1]?.pledge || 0;

                const startPosition = prevSum + 1;
                const endPosition = prevSum + pledge1;

                const { share: sharesForPrevSum, percentage: percentageForPrevSum } = addShares({
                    profit: currentPledgeToShare,
                    participants: sumOfPrevPledges,
                    startPosition,
                    endPosition,
                    exponent,
                });
                updatedParticipants[index1]!.distributionStart = startPosition
                updatedParticipants[index1]!.distributionEnd = endPosition

                updatedParticipants[index1]!.rewardBacker =
                    (updatedParticipants[index1]!.rewardBacker || 0) +
                    sharesForPrevSum;

                updatedParticipants[index1]!.percentageBacker = percentageForPrevSum;

                prevSum += pledge1;
            }

            sumOfPrevPledges += currentPledgeToShare;

            updatedParticipants.push(participantClone);
        }
    });

    if (updatedParticipants.length === 1 && updatedParticipants[0]) {
        updatedParticipants[0].percentageBacker = 100;
    }

    return updatedParticipants;
};

export function customersToBackers(customers: Customer[]): Distribution["participants"] {
    const participants: Distribution["participants"] = []
    customers.forEach((customer, i) => {
        const participant: Distribution['participants'][0] = {
            pledge: (customer.amount || 0) / 100,
            nrOfPeople: 1,
            timestamp: customer.created * 1000,
            email: customer.email
        }
        participants.push(participant)
    })
    return participants
}
