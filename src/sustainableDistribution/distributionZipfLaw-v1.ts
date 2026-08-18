/**
 * Dynamic Ranking System with Zipf Distribution
 * 
 * People negotiate SLOTS (positions), math determines PERCENTAGES
 * Future-proof: works for 2 to 10,000+ participants
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * A participant in the ranking system
 */
export interface Participant {
    /** Unique identifier */
    id: string;
    /** Display name */
    name: string;
    /** Current slot/position (1 = highest) */
    slot: number;
    /** Who negotiated this slot */
    lastNegotiator?: string;
    /** When this slot was last negotiated */
    lastNegotiated?: Date;
    /** Version for optimistic locking */
    version: number;
}

/**
 * Configuration for the ranking system
 */
export interface RankingConfig {
    /** Zipf exponent (1.0 = classic Zipf, >1.0 = steeper, <1.0 = flatter) */
    zipfExponent?: number;
    /** Minimum percentage any participant can receive (prevents zero) */
    minPercentage?: number;
    /** Total profit pool */
    totalProfit: number;
    /** Currency symbol */
    currencySymbol?: string;
    /** Decimal places */
    decimals?: number;
}

/**
 * Individual distribution result
 */
export interface SlotDistribution {
    slot: number;
    percentage: number;
    payout: number;
    cumulative?: number;
}

/**
 * Complete ranking with distributions
 */
export interface RankingSnapshot {
    /** Current participants in slot order */
    participants: Participant[];
    /** Distribution for each slot */
    distributions: SlotDistribution[];
    /** Total profit */
    totalProfit: number;
    /** Metadata */
    metadata: {
        totalParticipants: number;
        zipfExponent: number;
        topPercentage: number;
        bottomPercentage: number;
        topPayout: number;
        bottomPayout: number;
        /** Percentage gap between adjacent slots */
        averageAdjacentGap: number;
    };
}

/**
 * Result of a slot negotiation
 */
export interface NegotiationResult {
    success: boolean;
    participantId: string;
    newSlot: number;
    oldSlot?: number;
    /** Participants whose slots changed (pushed down) */
    affectedParticipants: Array<{
        id: string;
        oldSlot: number;
        newSlot: number;
    }>;
    message: string;
    newSnapshot: RankingSnapshot;
}

// ============================================
// ZIPF DISTRIBUTION ENGINE
// ============================================

/**
 * Calculate Zipf distribution for N participants
 * 
 * Zipf's Law: P(rank) = (1/rank^s) / sum(1/i^s for i=1 to N)
 * where s is the exponent (1.0 = classic)
 */
export class ZipfDistribution {
    /**
     * Calculate percentages for N slots using Zipf's Law
     */
    static calculate(
        totalSlots: number,
        exponent: number = 1.0,
        minPercentage: number = 0.01
    ): number[] {
        if (totalSlots < 1) return [];
        if (totalSlots === 1) return [100];

        // Calculate raw Zipf weights
        const weights: number[] = [];
        let sumWeights = 0;

        for (let i = 1; i <= totalSlots; i++) {
            const weight = 1 / Math.pow(i, exponent);
            weights.push(weight);
            sumWeights += weight;
        }

        // Convert to percentages
        let percentages = weights.map(w => (w / sumWeights) * 100);

        // Apply minimum percentage floor
        if (minPercentage > 0) {
            // Ensure bottom slots don't go below minimum
            const totalMin = minPercentage * totalSlots;

            // If total minimum exceeds 100%, scale down
            if (totalMin > 100) {
                const scaledMin = 100 / totalSlots;
                percentages = percentages.map(p => Math.max(p, scaledMin));
            } else {
                percentages = percentages.map(p => Math.max(p, minPercentage));
            }

            // Renormalize to ensure sum = 100
            const sum = percentages.reduce((a, b) => a + b, 0);
            percentages = percentages.map(p => (p / sum) * 100);
        }

        return percentages;
    }

    /**
     * Get distribution for a specific slot
     */
    static getSlotPercentage(
        slot: number,
        totalSlots: number,
        exponent: number = 1.0
    ): number {
        if (slot < 1 || slot > totalSlots) return 0;
        const percentages = this.calculate(totalSlots, exponent);
        return percentages[slot - 1];
    }

    /**
     * Find what slot would give a target percentage
     * Useful for negotiation: "I want at least 5%"
     */
    static findSlotForPercentage(
        targetPercent: number,
        totalSlots: number,
        exponent: number = 1.0
    ): number {
        const percentages = this.calculate(totalSlots, exponent);
        for (let i = 0; i < percentages.length; i++) {
            if (percentages[i] >= targetPercent) {
                return i + 1;
            }
        }
        return totalSlots;
    }
}

// ============================================
// DYNAMIC RANKING SYSTEM
// ============================================

/**
 * Main ranking system with slot-based negotiation
 */
export class RankingSystem {
    private participants: Map<string, Participant> = new Map();
    private slotMap: Map<number, string> = new Map();
    private config: RankingConfig;
    private nextId: number = 1;

    constructor(config: RankingConfig) {
        this.config = {
            zipfExponent: 1.0,
            minPercentage: 0.01,
            currencySymbol: '$',
            decimals: 2,
            ...config
        };
    }

    /**
     * Add a new participant to the end of the list
     */
    addParticipant(name: string): Participant {
        const id = `p${this.nextId++}`;
        const slot = this.participants.size + 1;

        const participant: Participant = {
            id,
            name,
            slot,
            version: 1,
            lastNegotiated: new Date()
        };

        this.participants.set(id, participant);
        this.slotMap.set(slot, id);

        return participant;
    }

    /**
     * Negotiate a new slot for a participant
     * This is the core operation: person wants slot X, others get pushed down
     */
    negotiateSlot(
        participantId: string,
        desiredSlot: number,
        negotiator: string = 'system'
    ): NegotiationResult {
        // Validate
        const participant = this.participants.get(participantId);
        if (!participant) {
            return this.createFailedResult(
                participantId,
                desiredSlot,
                `Participant ${participantId} not found`
            );
        }

        const totalSlots = this.participants.size;
        if (desiredSlot < 1 || desiredSlot > totalSlots) {
            return this.createFailedResult(
                participantId,
                desiredSlot,
                `Slot must be between 1 and ${totalSlots}`
            );
        }

        const oldSlot = participant.slot;

        // If same slot, no change needed
        if (oldSlot === desiredSlot) {
            return this.createSuccessResult(
                participantId,
                desiredSlot,
                oldSlot,
                [],
                'Slot unchanged',
                this.createSnapshot()
            );
        }

        // Determine affected participants
        const affected: Array<{ id: string; oldSlot: number; newSlot: number }> = [];

        if (desiredSlot < oldSlot) {
            // Moving UP: people between desired and old-1 move down one
            for (let slot = desiredSlot; slot < oldSlot; slot++) {
                const id = this.slotMap.get(slot);
                if (id) {
                    affected.push({
                        id,
                        oldSlot: slot,
                        newSlot: slot + 1
                    });
                }
            }
        } else {
            // Moving DOWN: people between old+1 and desired move up one
            for (let slot = oldSlot + 1; slot <= desiredSlot; slot++) {
                const id = this.slotMap.get(slot);
                if (id) {
                    affected.push({
                        id,
                        oldSlot: slot,
                        newSlot: slot - 1
                    });
                }
            }
        }

        // Apply changes
        // 1. Update affected participants
        for (const change of affected) {
            const p = this.participants.get(change.id);
            if (p) {
                p.slot = change.newSlot;
                p.version++;
                p.lastNegotiated = new Date();
                p.lastNegotiator = negotiator;
                this.slotMap.set(change.newSlot, change.id);
            }
        }

        // 2. Update the negotiating participant
        participant.slot = desiredSlot;
        participant.version++;
        participant.lastNegotiated = new Date();
        participant.lastNegotiator = negotiator;
        this.slotMap.set(desiredSlot, participantId);

        // 3. Rebuild slot map (clean up any gaps)
        this.rebuildSlotMap();

        return this.createSuccessResult(
            participantId,
            desiredSlot,
            oldSlot,
            affected,
            `Moved ${participant.name} from slot ${oldSlot} to ${desiredSlot}`,
            this.createSnapshot()
        );
    }

    /**
     * Get the current distribution using Zipf's Law
     */
    getDistribution(): RankingSnapshot {
        return this.createSnapshot();
    }

    /**
     * Get all participants in slot order
     */
    getParticipantsInOrder(): Participant[] {
        const ordered: Participant[] = [];
        for (let slot = 1; slot <= this.participants.size; slot++) {
            const id = this.slotMap.get(slot);
            if (id) {
                const p = this.participants.get(id);
                if (p) ordered.push(p);
            }
        }
        return ordered;
    }

    /**
     * Calculate percentages using Zipf distribution
     */
    private calculateDistribution(): number[] {
        const total = this.participants.size;
        return ZipfDistribution.calculate(
            total,
            this.config.zipfExponent,
            this.config.minPercentage
        );
    }

    /**
     * Create a snapshot of the current ranking with distributions
     */
    private createSnapshot(): RankingSnapshot {
        const ordered = this.getParticipantsInOrder();
        const percentages = this.calculateDistribution();
        const total = ordered.length;
        const { totalProfit, decimals = 2 } = this.config;

        const distributions: SlotDistribution[] = [];
        let cumulative = 0;

        for (let i = 0; i < total; i++) {
            const pct = percentages[i] || 0;
            const payout = (pct / 100) * totalProfit;
            cumulative += payout;

            distributions.push({
                slot: i + 1,
                percentage: Number(pct.toFixed(decimals)),
                payout: Number(payout.toFixed(2)),
                cumulative: Number(cumulative.toFixed(2))
            });
        }

        // Calculate metadata
        const topPct = distributions[0]?.percentage || 0;
        const bottomPct = distributions[total - 1]?.percentage || 0;
        const topPayout = distributions[0]?.payout || 0;
        const bottomPayout = distributions[total - 1]?.payout || 0;

        // Average adjacent gap
        let totalGap = 0;
        for (let i = 0; i < total - 1; i++) {
            totalGap += distributions[i].percentage - distributions[i + 1].percentage;
        }
        const avgGap = total > 1 ? totalGap / (total - 1) : 0;

        return {
            participants: ordered,
            distributions,
            totalProfit,
            metadata: {
                totalParticipants: total,
                zipfExponent: this.config.zipfExponent || 1.0,
                topPercentage: topPct,
                bottomPercentage: bottomPct,
                topPayout,
                bottomPayout,
                averageAdjacentGap: Number(avgGap.toFixed(decimals))
            }
        };
    }

    /**
     * Rebuild slot map to ensure no gaps
     */
    private rebuildSlotMap(): void {
        const ordered = this.getParticipantsInOrder();
        const newSlotMap = new Map<number, string>();

        for (let i = 0; i < ordered.length; i++) {
            const slot = i + 1;
            const p = ordered[i];
            p.slot = slot;
            newSlotMap.set(slot, p.id);
        }

        this.slotMap = newSlotMap;
    }

    private createFailedResult(
        participantId: string,
        desiredSlot: number,
        message: string
    ): NegotiationResult {
        return {
            success: false,
            participantId,
            newSlot: desiredSlot,
            affectedParticipants: [],
            message,
            newSnapshot: this.createSnapshot()
        };
    }

    private createSuccessResult(
        participantId: string,
        newSlot: number,
        oldSlot: number,
        affected: Array<{ id: string; oldSlot: number; newSlot: number }>,
        message: string,
        snapshot: RankingSnapshot
    ): NegotiationResult {
        return {
            success: true,
            participantId,
            newSlot,
            oldSlot,
            affectedParticipants: affected,
            message,
            newSnapshot: snapshot
        };
    }
}

// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * Example 1: Basic usage with 20 participants
 */
function exampleBasicUsage() {
    const system = new RankingSystem({
        totalProfit: 2000,
        zipfExponent: 1.0,
        currencySymbol: '$',

    });

    // Add 20 participants
    for (let i = 1; i <= 20; i++) {
        system.addParticipant(`Person ${i}`);
    }

    // Get the distribution
    const snapshot = system.getDistribution();

    console.log('=== Zipf Distribution (20 people) ===');
    console.log(`Total Profit: $${snapshot.totalProfit.toLocaleString()}`);
    console.log(`Top: ${snapshot.metadata.topPercentage}% ($${snapshot.metadata.topPayout.toLocaleString()})`);
    console.log(`Bottom: ${snapshot.metadata.bottomPercentage}% ($${snapshot.metadata.bottomPayout.toLocaleString()})`);
    console.log(`Ratio: ${(snapshot.metadata.topPercentage / snapshot.metadata.bottomPercentage).toFixed(2)}x`);
    console.log(`Average gap: ${snapshot.metadata.averageAdjacentGap}%\n`);

    snapshot.distributions.forEach(d => {
        console.log(`  Slot ${d.slot}: ${d.percentage}% = $${d.payout.toLocaleString()}`);
    });

    // Show first 5 and last 5
    /* console.log('Top 5:');
    snapshot.distributions.slice(0, 5).forEach(d => {
      console.log(`  Slot ${d.slot}: ${d.percentage}% = $${d.payout.toLocaleString()}`);
    });
    
    console.log('\nBottom 5:');
    snapshot.distributions.slice(-5).forEach(d => {
      console.log(`  Slot ${d.slot}: ${d.percentage}% = $${d.payout.toLocaleString()}`);
    }); */
}

/**
 * Example 2: Slot negotiation
 */
function exampleNegotiation() {
    const system = new RankingSystem({
        totalProfit: 100000
    });

    // Add 10 people
    for (let i = 1; i <= 10; i++) {
        system.addParticipant(`Person ${i}`);
    }

    console.log('=== Initial Ranking ===');
    const initial = system.getDistribution();
    console.log('Top 3:');
    initial.distributions.slice(0, 3).forEach(d => {
        const p = initial.participants[d.slot - 1];
        console.log(`  ${p.name}: ${d.percentage}%`);
    });

    // Person 10 wants slot 3 (moves up, pushing others down)
    const person10 = system.getParticipantsInOrder()[9]; // Last person
    console.log(`\n${person10.name} negotiates for slot 3...`);

    const result = system.negotiateSlot(person10.id, 3, person10.name);

    if (result.success) {
        console.log(`✓ Success! ${person10.name} moved from ${result.oldSlot} to ${result.newSlot}`);
        console.log(`Affected: ${result.affectedParticipants.length} people pushed down`);

        // Show new ranking
        const newSnapshot = result.newSnapshot;
        console.log('\nNew Top 3:');
        newSnapshot.distributions.slice(0, 3).forEach(d => {
            const p = newSnapshot.participants[d.slot - 1];
            console.log(`  ${p.name}: ${d.percentage}%`);
        });
    }
}

/**
 * Example 3: Compare exponents
 */
function exampleCompareExponents() {
    const totalProfit = 100000;
    const participants = 20;

    console.log('=== Comparing Zipf Exponents (20 people) ===\n');

    [0.8, 1.0, 1.2, 1.5].forEach(exponent => {
        const system = new RankingSystem({
            totalProfit,
            zipfExponent: exponent
        });

        for (let i = 1; i <= participants; i++) {
            system.addParticipant(`P${i}`);
        }

        const snapshot = system.getDistribution();
        const { topPercentage, bottomPercentage, averageAdjacentGap } = snapshot.metadata;

        console.log(`Exponent ${exponent}:`);
        console.log(`  Top: ${topPercentage}%, Bottom: ${bottomPercentage}%`);
        console.log(`  Ratio: ${(topPercentage / bottomPercentage).toFixed(2)}x`);
        console.log(`  Avg gap: ${averageAdjacentGap}%`);
        console.log(`  Top 3 share: ${snapshot.distributions.slice(0, 3).reduce((s, d) => s + d.percentage, 0).toFixed(1)}%`);
        console.log('');
    });
}

/**
 * Example 4: Large list (100 people)
 */
function exampleLargeList() {
    const system = new RankingSystem({
        totalProfit: 1000000,
        zipfExponent: 1.0,
        currencySymbol: '$'
    });

    // Add 100 people
    for (let i = 1; i <= 100; i++) {
        system.addParticipant(`Employee ${i}`);
    }

    const snapshot = system.getDistribution();

    console.log('=== Zipf Distribution (100 people, $1,000,000) ===');
    console.log(`Top: ${snapshot.metadata.topPercentage}% = $${snapshot.metadata.topPayout.toLocaleString()}`);
    console.log(`Bottom: ${snapshot.metadata.bottomPercentage}% = $${snapshot.metadata.bottomPayout.toLocaleString()}`);
    console.log(`Ratio: ${(snapshot.metadata.topPercentage / snapshot.metadata.bottomPercentage).toFixed(2)}x`);

    // Show every 10th person
    console.log('\nEvery 10th participant:');
    for (let slot = 1; slot <= 100; slot += 10) {
        const d = snapshot.distributions[slot - 1];
        const p = snapshot.participants[slot - 1];
        if (d && p) {
            console.log(`  Slot ${slot}: ${d.percentage}% = $${d.payout.toLocaleString()}`);
        }
    }
}



// ============================================
// RUN EXAMPLES
// ============================================

// console.log('=== ZIPF DISTRIBUTION RANKING SYSTEM ===\n');

// exampleBasicUsage();
// console.log('\n' + '='.repeat(50) + '\n');
// exampleNegotiation();
// console.log('\n' + '='.repeat(50) + '\n');
// exampleCompareExponents();
// console.log('\n' + '='.repeat(50) + '\n');
// exampleLargeList();


export function zipfsLaw({
    participants,
    profit,
    exponent = 1.0,
    decimals = 2
}: {
    participants: number,
    profit: number,
    exponent?: number,
    decimals?: number,
}) {
    const system = new RankingSystem({
        totalProfit: profit,
        zipfExponent: exponent,
        currencySymbol: '€',
        decimals: decimals,

    });
    for (let i = 1; i <= participants; i++) {
        system.addParticipant(`Person ${i}`);
    }

    return system.getDistribution();
}


function playground() {
    const system = new RankingSystem({
        totalProfit: 2000,
        zipfExponent: 0.2,
        currencySymbol: '$',

    });

    // Add 20 participants
    for (let i = 1; i <= 2; i++) {
        system.addParticipant(`Person ${i}`);
    }

    // Get the distribution
    const snapshot = system.getDistribution();

    console.log('=== Zipf Distribution (20 people) ===');
    console.log(`Total Profit: $${snapshot.totalProfit.toLocaleString()}`);
    console.log(`Top: ${snapshot.metadata.topPercentage}% ($${snapshot.metadata.topPayout.toLocaleString()})`);
    console.log(`Bottom: ${snapshot.metadata.bottomPercentage}% ($${snapshot.metadata.bottomPayout.toLocaleString()})`);
    console.log(`Ratio: ${(snapshot.metadata.topPercentage / snapshot.metadata.bottomPercentage).toFixed(2)}x`);
    console.log(`Average gap: ${snapshot.metadata.averageAdjacentGap}%\n`);

    snapshot.distributions.forEach(d => {
        console.log(`  Slot ${d.slot}: ${d.percentage}% = $${d.payout.toLocaleString()}`);
    });

    // Show first 5 and last 5
    /* console.log('Top 5:');
    snapshot.distributions.slice(0, 5).forEach(d => {
      console.log(`  Slot ${d.slot}: ${d.percentage}% = $${d.payout.toLocaleString()}`);
    });
    
    console.log('\nBottom 5:');
    snapshot.distributions.slice(-5).forEach(d => {
      console.log(`  Slot ${d.slot}: ${d.percentage}% = $${d.payout.toLocaleString()}`);
    }); */
}

// playground()
