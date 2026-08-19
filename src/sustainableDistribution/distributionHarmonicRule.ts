/**
 * Harmonic Rule Distribution
 * 
 * Percentages are proportional to 1/rank, normalized by harmonic sum
 * Formula: P(r) = (1/r) / H_n * 100
 * Where H_n = Σ(1/i) for i=1 to n
 * 
 * This creates a natural power-law distribution where:
 * - Top positions get significantly more
 * - Bottom positions still get meaningful amounts
 * - The curve automatically adjusts for any list size
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Configuration for the distribution
 */
export interface HarmonicConfig {
    /** Total profit to distribute */
    totalProfit: number;
    
    /** 
     * Exponent for generalized harmonic distribution
     * - 1.0 = classic harmonic (default)
     * - >1.0 = steeper (top gets more)
     * - <1.0 = flatter (more equal)
     * Range: 0.5 to 2.0
     */
    exponent?: number;
    
    /** Decimal places for percentages (default: 2) */
    decimals?: number;
    
    /** Currency symbol (default: '$') */
    currencySymbol?: string;
    
    /** Minimum percentage any participant can receive (default: 0.01) */
    minPercentage?: number;
}

/**
 * Distribution result for a single slot
 */
export interface HarmonicSlot {
    /** Slot/rank position (1 = highest) */
    slot: number;
    
    /** Percentage of total profit (e.g., 27.80 means 27.80%) */
    percentage: number;
    
    /** Monetary amount allocated */
    payout: number;
    
    /** Running total (optional) */
    cumulative?: number;
    
    /** Formatted percentage string */
    percentageFormatted?: string;
    
    /** Formatted payout string */
    payoutFormatted?: string;
}

/**
 * Complete distribution snapshot
 */
export interface HarmonicSnapshot {
    /** Distribution for each slot */
    slots: HarmonicSlot[];
    
    /** Total profit */
    totalProfit: number;
    
    /** Metadata about the distribution */
    metadata: {
        /** Number of participants */
        totalParticipants: number;
        
        /** Harmonic sum H_n (or generalized sum) */
        harmonicSum: number;
        
        /** Exponent used */
        exponent: number;
        
        /** Top slot percentage */
        topPercentage: number;
        
        /** Bottom slot percentage */
        bottomPercentage: number;
        
        /** Top slot payout */
        topPayout: number;
        
        /** Bottom slot payout */
        bottomPayout: number;
        
        /** Ratio between top and bottom */
        topBottomRatio: number;
        
        /** Gini coefficient (0=perfect equality, 1=perfect inequality) */
        giniCoefficient: number;
        
        /** Average percentage across all slots */
        averagePercentage: number;
    };
}

/**
 * Participant in the ranking system
 */
export interface Participant {
    id: string;
    name: string;
    slot: number;
    lastNegotiator?: string;
    lastNegotiated?: Date;
    version: number;
}

/**
 * Result of a slot negotiation
 */
export interface NegotiationResult {
    success: boolean;
    participantId: string;
    newSlot: number;
    oldSlot?: number;
    affectedParticipants: Array<{
        id: string;
        oldSlot: number;
        newSlot: number;
    }>;
    message: string;
    newSnapshot: HarmonicSnapshot;
}

// ============================================
// CORE CALCULATIONS
// ============================================

/**
 * Calculate generalized harmonic sum
 * H_n(s) = Σ(1/i^s) for i=1 to n
 * 
 * @param n - Number of terms
 * @param exponent - Power exponent (default: 1.0)
 * @returns The harmonic sum
 */
export function harmonicSum(n: number, exponent: number = 1.0): number {
    if (n <= 0) return 0;
    
    // For small n or non-integer exponent, calculate exactly
    if (n < 1000 || exponent !== 1.0) {
        let sum = 0;
        for (let i = 1; i <= n; i++) {
            sum += 1 / Math.pow(i, exponent);
        }
        return sum;
    }
    
    // For large n with exponent = 1.0, use approximation
    // H_n ≈ ln(n) + γ + 1/(2n) - 1/(12n^2) + 1/(120n^4)
    const gamma = 0.5772156649015329; // Euler-Mascheroni constant
    const ln_n = Math.log(n);
    const inv_n = 1 / n;
    const inv_n2 = inv_n * inv_n;
    
    return ln_n + gamma + (0.5 * inv_n) - (1/12 * inv_n2) + (1/120 * inv_n2 * inv_n2);
}

/**
 * Calculate percentage for a specific rank
 * 
 * @param rank - Position (1 = highest)
 * @param totalParticipants - Total number of participants
 * @param H - Pre-calculated harmonic sum (optional)
 * @param exponent - Power exponent (default: 1.0)
 * @returns Percentage (as a number, e.g., 27.8 means 27.8%)
 */
export function harmonicPercentage(
    rank: number,
    totalParticipants: number,
    H?: number,
    exponent: number = 1.0
): number {
    if (rank < 1 || rank > totalParticipants) return 0;
    
    const harmonic = H || harmonicSum(totalParticipants, exponent);
    const weight = 1 / Math.pow(rank, exponent);
    
    return (weight / harmonic) * 100;
}

/**
 * Generate full distribution for n participants using harmonic rule
 * 
 * @param totalParticipants - Number of participants (must be >= 2)
 * @param totalProfit - Total profit to distribute
 * @param config - Optional configuration
 * @returns Complete distribution snapshot
 * @throws {Error} If totalParticipants < 2 or totalProfit <= 0
 */
export function harmonicDistribution(
    totalParticipants: number,
    totalProfit: number,
    config: Partial<HarmonicConfig> = {}
): HarmonicSnapshot {
    // Validation
    if (totalParticipants < 2) {
        throw new Error(`Total participants must be at least 2 (got ${totalParticipants})`);
    }
    
    if (totalProfit <= 0) {
        throw new Error(`Total profit must be greater than 0 (got ${totalProfit})`);
    }
    
    // Configuration
    const exponent = config.exponent ?? 1.0;
    const decimals = config.decimals ?? 2;
    const currencySymbol = config.currencySymbol ?? '$';
    const minPercentage = config.minPercentage ?? 0.01;
    
    // Validate exponent range
    if (exponent < 0.5 || exponent > 2.0) {
        throw new Error(`Exponent must be between 0.5 and 2.0 (got ${exponent})`);
    }
    
    // Calculate harmonic sum
    const H = harmonicSum(totalParticipants, exponent);
    
    // Calculate raw weights and apply minimum percentage floor
    const weights: number[] = [];
    let sumWeights = 0;
    for (let slot = 1; slot <= totalParticipants; slot++) {
        const weight = 1 / Math.pow(slot, exponent);
        weights.push(weight);
        sumWeights += weight;
    }

    let percentages: number[] = [];
    const totalMin = minPercentage * totalParticipants;
    if (totalMin >= 100) {
        percentages = Array(totalParticipants).fill(100 / totalParticipants);
    } else {
        percentages = weights.map(w => (w / sumWeights) * 100);
        let allocated = new Set<number>();
        let changed = true;
        while (changed) {
            changed = false;
            let fixedSum = 0;
            let activeWeightSum = 0;
            for (let i = 0; i < totalParticipants; i++) {
                if (allocated.has(i)) {
                    fixedSum += minPercentage;
                } else {
                    activeWeightSum += weights[i];
                }
            }
            
            const remainingPercentage = 100 - fixedSum;
            for (let i = 0; i < totalParticipants; i++) {
                if (!allocated.has(i)) {
                    const p = (weights[i] / activeWeightSum) * remainingPercentage;
                    if (p < minPercentage) {
                        allocated.add(i);
                        changed = true;
                    } else {
                        percentages[i] = p;
                    }
                } else {
                    percentages[i] = minPercentage;
                }
            }
        }
    }
    
    // Generate distribution slots
    const slots: HarmonicSlot[] = [];
    let cumulative = 0;
    
    for (let i = 0; i < totalParticipants; i++) {
        const slot = i + 1;
        const percentage = percentages[i];
        const payout = (percentage / 100) * totalProfit;
        cumulative += payout;
        
        // Round to specified decimals
        const roundedPercentage = Number(percentage.toFixed(decimals));
        const roundedPayout = Number(payout.toFixed(2));
        
        slots.push({
            slot,
            percentage: roundedPercentage,
            payout: roundedPayout,
            cumulative: Number(cumulative.toFixed(2)),
            percentageFormatted: `${roundedPercentage.toFixed(decimals)}%`,
            payoutFormatted: `${currencySymbol}${roundedPayout.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`
        });
    }
    
    // Fix floating point precision for the last slot
    const sumPercentages = slots.reduce((sum, s) => sum + s.percentage, 0);
    if (Math.abs(sumPercentages - 100) > 0.0001) {
        const diff = 100 - sumPercentages;
        const lastSlot = slots[slots.length - 1];
        lastSlot.percentage = Number((lastSlot.percentage + diff).toFixed(decimals));
        lastSlot.payout = Number(((lastSlot.percentage / 100) * totalProfit).toFixed(2));
        lastSlot.percentageFormatted = `${lastSlot.percentage.toFixed(decimals)}%`;
        lastSlot.payoutFormatted = `${currencySymbol}${lastSlot.payout.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    // Ensure cumulative sum matches totalProfit exactly
    let runningCumulative = 0;
    for (let i = 0; i < slots.length; i++) {
        runningCumulative += slots[i].payout;
        slots[i].cumulative = Number(runningCumulative.toFixed(2));
    }
    
    // Calculate Gini coefficient
    const finalPercentages = slots.map(s => s.percentage);
    const gini = calculateGini(finalPercentages);
    
    // Metadata
    const topSlot = slots[0];
    const bottomSlot = slots[slots.length - 1];
    const avgPercentage = finalPercentages.reduce((sum, p) => sum + p, 0) / totalParticipants;
    
    return {
        slots,
        totalProfit,
        metadata: {
            totalParticipants,
            harmonicSum: H,
            exponent,
            topPercentage: topSlot.percentage,
            bottomPercentage: bottomSlot.percentage,
            topPayout: topSlot.payout,
            bottomPayout: bottomSlot.payout,
            topBottomRatio: Number((topSlot.percentage / bottomSlot.percentage).toFixed(2)),
            giniCoefficient: Number(gini.toFixed(4)),
            averagePercentage: Number(avgPercentage.toFixed(decimals))
        }
    };
}

/**
 * Calculate Gini coefficient for a distribution
 * 0 = perfect equality, 1 = perfect inequality
 */
function calculateGini(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((s, v) => s + v, 0);
    
    if (sum === 0) return 0;
    
    let numerator = 0;
    for (let i = 0; i < n; i++) {
        numerator += sorted[i] * (i + 1);
    }
    
    const gini = (2 * numerator) / (n * sum) - (n + 1) / n;
    return Math.max(0, Math.min(1, gini));
}

// ============================================
// DYNAMIC RANKING SYSTEM
// ============================================

/**
 * Ranking System using Harmonic Rule distribution
 * 
 * People negotiate SLOTS (positions), math determines percentages
 */
export class HarmonicRankingSystem {
    private participants: Map<string, Participant> = new Map();
    private slotMap: Map<number, string> = new Map();
    private nextId: number = 1;
    private config: HarmonicConfig;
    
    constructor(config: HarmonicConfig) {
        this.config = {
            totalProfit: config.totalProfit,
            exponent: config.exponent ?? 1.0,
            decimals: config.decimals ?? 2,
            currencySymbol: config.currencySymbol ?? '$',
            minPercentage: config.minPercentage ?? 0.01
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
            lastNegotiator: 'system',
            lastNegotiated: new Date()
        };
        
        this.participants.set(id, participant);
        this.slotMap.set(slot, id);
        
        return participant;
    }
    
    /**
     * Remove a participant from the list
     * This closes the gap, moving everyone below up one slot
     */
    removeParticipant(id: string): {
        success: boolean;
        message: string;
        affectedParticipants: Array<{id: string; oldSlot: number; newSlot: number}>;
        newSnapshot: HarmonicSnapshot;
    } {
        const participant = this.participants.get(id);
        if (!participant) {
            return {
                success: false,
                message: `Participant ${id} not found`,
                affectedParticipants: [],
                newSnapshot: this.getDistribution()
            };
        }
        
        const removedSlot = participant.slot;
        const affected: Array<{id: string; oldSlot: number; newSlot: number}> = [];
        
        // Remove from maps
        this.participants.delete(id);
        this.slotMap.delete(removedSlot);
        
        // Move everyone below up one slot
        const ordered = this.getParticipantsInOrder();
        for (let i = removedSlot - 1; i < ordered.length; i++) {
            const p = ordered[i];
            if (p) {
                const oldSlot = p.slot;
                p.slot = i + 1;
                p.version++;
                affected.push({
                    id: p.id,
                    oldSlot,
                    newSlot: p.slot
                });
            }
        }
        
        this.rebuildSlotMap();
        
        return {
            success: true,
            message: `Removed ${participant.name}`,
            affectedParticipants: affected,
            newSnapshot: this.getDistribution()
        };
    }
    
    /**
     * Negotiate a new slot for a participant
     * Moving up pushes others down, moving down pulls others up
     */
    negotiateSlot(
        participantId: string,
        desiredSlot: number,
        negotiator: string = 'system'
    ): NegotiationResult {
        // Validate participant exists
        const participant = this.participants.get(participantId);
        if (!participant) {
            return this.createFailedResult(
                participantId,
                desiredSlot,
                `Participant ${participantId} not found`
            );
        }
        
        const totalSlots = this.participants.size;
        
        // Validate slot range
        if (desiredSlot < 1 || desiredSlot > totalSlots) {
            return this.createFailedResult(
                participantId,
                desiredSlot,
                `Slot must be between 1 and ${totalSlots} (got ${desiredSlot})`
            );
        }
        
        const oldSlot = participant.slot;
        
        // No change needed
        if (oldSlot === desiredSlot) {
            return this.createSuccessResult(
                participantId,
                desiredSlot,
                oldSlot,
                [],
                'No change needed',
                this.getDistribution()
            );
        }
        
        const affected: Array<{id: string; oldSlot: number; newSlot: number}> = [];
        
        if (desiredSlot < oldSlot) {
            // Moving UP: push people between desired and old-1 down
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
            // Moving DOWN: pull people between old+1 and desired up
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
        
        // Apply changes to affected participants
        for (const change of affected) {
            const p = this.participants.get(change.id);
            if (p) {
                p.slot = change.newSlot;
                p.version++;
                p.lastNegotiator = negotiator;
                p.lastNegotiated = new Date();
                this.slotMap.set(change.newSlot, change.id);
            }
        }
        
        // Apply change to the negotiating participant
        participant.slot = desiredSlot;
        participant.version++;
        participant.lastNegotiator = negotiator;
        participant.lastNegotiated = new Date();
        this.slotMap.set(desiredSlot, participantId);
        
        // Rebuild slot map to ensure consistency
        this.rebuildSlotMap();
        
        return this.createSuccessResult(
            participantId,
            desiredSlot,
            oldSlot,
            affected,
            `Moved ${participant.name} from slot ${oldSlot} to ${desiredSlot}`,
            this.getDistribution()
        );
    }
    
    /**
     * Get current distribution using harmonic rule
     */
    getDistribution(): HarmonicSnapshot {
        return harmonicDistribution(
            this.participants.size,
            this.config.totalProfit,
            {
                exponent: this.config.exponent,
                decimals: this.config.decimals,
                currencySymbol: this.config.currencySymbol,
                minPercentage: this.config.minPercentage
            }
        );
    }
    
    /**
     * Get all participants in slot order
     */
    getParticipantsInOrder(): Participant[] {
        return Array.from(this.participants.values()).sort((a, b) => a.slot - b.slot);
    }
    
    /**
     * Get a participant's current information
     */
    getParticipantInfo(id: string): {
        participant: Participant;
        percentage: number;
        payout: number;
    } | null {
        const participant = this.participants.get(id);
        if (!participant) return null;
        
        const distribution = this.getDistribution();
        const slotInfo = distribution.slots[participant.slot - 1];
        
        if (!slotInfo) return null;
        
        return {
            participant,
            percentage: slotInfo.percentage,
            payout: slotInfo.payout
        };
    }
    
    /**
     * Get the current slot for a participant
     */
    getSlot(id: string): number | null {
        const participant = this.participants.get(id);
        return participant ? participant.slot : null;
    }
    
    /**
     * Get total number of participants
     */
    get totalParticipants(): number {
        return this.participants.size;
    }
    
    // ===== Private Methods =====
    
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
            newSnapshot: this.getDistribution()
        };
    }
    
    private createSuccessResult(
        participantId: string,
        newSlot: number,
        oldSlot: number,
        affected: Array<{id: string; oldSlot: number; newSlot: number}>,
        message: string,
        snapshot: HarmonicSnapshot
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
// HELPER FUNCTIONS
// ============================================

/**
 * Compare different exponents for the harmonic distribution
 */
export function compareExponents(
    participants: number = 20,
    totalProfit: number = 100000
): Array<{
    exponent: number;
    topPercentage: number;
    bottomPercentage: number;
    topBottomRatio: number;
    giniCoefficient: number;
    top20PercentShare: number;
    bottom20PercentShare: number;
}> {
    const exponents = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.5];
    const results = [];
    
    for (const exp of exponents) {
        const snapshot = harmonicDistribution(participants, totalProfit, { exponent: exp });
        const top20Count = Math.floor(participants * 0.2);
        const bottom20Count = Math.floor(participants * 0.2);
        
        const top20Share = snapshot.slots
            .slice(0, top20Count)
            .reduce((sum, s) => sum + s.percentage, 0);
        
        const bottom20Share = snapshot.slots
            .slice(-bottom20Count)
            .reduce((sum, s) => sum + s.percentage, 0);
        
        results.push({
            exponent: exp,
            topPercentage: snapshot.metadata.topPercentage,
            bottomPercentage: snapshot.metadata.bottomPercentage,
            topBottomRatio: snapshot.metadata.topBottomRatio,
            giniCoefficient: snapshot.metadata.giniCoefficient,
            top20PercentShare: Number(top20Share.toFixed(2)),
            bottom20PercentShare: Number(bottom20Share.toFixed(2))
        });
    }
    
    return results;
}

/**
 * Get a formatted summary of a distribution
 */
export function formatSnapshot(snapshot: HarmonicSnapshot): string {
    const { metadata } = snapshot;
    const lines = [
        '═══════════════════════════════════════════════',
        '  HARMONIC DISTRIBUTION SUMMARY',
        '═══════════════════════════════════════════════',
        `  Participants: ${metadata.totalParticipants}`,
        `  Total Profit: $${snapshot.totalProfit.toLocaleString()}`,
        `  Exponent: ${metadata.exponent}`,
        `  Harmonic Sum: ${metadata.harmonicSum.toFixed(4)}`,
        '',
        '  Top Slot:',
        `    Percentage: ${metadata.topPercentage}%`,
        `    Payout: $${metadata.topPayout.toLocaleString()}`,
        '',
        '  Bottom Slot:',
        `    Percentage: ${metadata.bottomPercentage}%`,
        `    Payout: $${metadata.bottomPayout.toLocaleString()}`,
        '',
        `  Top/Bottom Ratio: ${metadata.topBottomRatio}x`,
        `  Gini Coefficient: ${metadata.giniCoefficient}`,
        `  Average Percentage: ${metadata.averagePercentage}%`,
        '═══════════════════════════════════════════════'
    ];
    
    return lines.join('\n');
}

// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * Example 1: Basic distribution
 */
function exampleBasicDistribution() {
    console.log('\n=== Basic Harmonic Distribution ===\n');
    
    const snapshot = harmonicDistribution(20, 100000);
    
    console.log('Top 5 slots:');
    snapshot.slots.slice(0, 5).forEach(slot => {
        console.log(`  Slot ${slot.slot}: ${slot.percentage}% = $${slot.payout.toLocaleString()}`);
    });
    
    console.log('\nBottom 5 slots:');
    snapshot.slots.slice(-5).forEach(slot => {
        console.log(`  Slot ${slot.slot}: ${slot.percentage}% = $${slot.payout.toLocaleString()}`);
    });
    
    console.log('\n' + formatSnapshot(snapshot));
}

/**
 * Example 2: Compare exponents
 */
function exampleCompareExponents() {
    console.log('\n=== Comparing Exponents (20 people) ===\n');
    
    const comparisons = compareExponents(20, 100000);
    
    console.log('Exp | Top% | Bottom% | Ratio | Gini | Top 20% | Bottom 20%');
    console.log('----|------|---------|-------|------|---------|----------');
    
    comparisons.forEach(c => {
        console.log(
            `${String(c.exponent).padStart(3)} | ` +
            `${String(c.topPercentage).padStart(4)}% | ` +
            `${String(c.bottomPercentage).padStart(7)}% | ` +
            `${String(c.topBottomRatio).padStart(5)}x | ` +
            `${c.giniCoefficient.toFixed(3)} | ` +
            `${String(c.top20PercentShare).padStart(7)}% | ` +
            `${String(c.bottom20PercentShare).padStart(8)}%`
        );
    });
}

/**
 * Example 3: Dynamic ranking with negotiation
 */
function exampleDynamicRanking() {
    console.log('\n=== Dynamic Ranking with Negotiation ===\n');
    
    const system = new HarmonicRankingSystem({
        totalProfit: 100000,
        exponent: 1.0
    });
    
    // Add 10 people
    for (let i = 1; i <= 10; i++) {
        system.addParticipant(`Person ${i}`);
    }
    
    console.log('Initial distribution:');
    const initial = system.getDistribution();
    initial.slots.slice(0, 5).forEach(slot => {
        const p = system.getParticipantsInOrder()[slot.slot - 1];
        console.log(`  Slot ${slot.slot}: ${p?.name} - ${slot.percentage}%`);
    });
    
    // Person 10 wants slot 3
    const person10 = system.getParticipantsInOrder()[9];
    console.log(`\n${person10.name} negotiates for Slot 3...`);
    
    const result = system.negotiateSlot(person10.id, 3, person10.name);
    
    if (result.success) {
        console.log(`✓ Success! ${result.affectedParticipants.length} people affected`);
        
        console.log('\nNew distribution:');
        const newSnapshot = result.newSnapshot;
        newSnapshot.slots.slice(0, 5).forEach(slot => {
            const p = system.getParticipantsInOrder()[slot.slot - 1];
            console.log(`  Slot ${slot.slot}: ${p?.name} - ${slot.percentage}%`);
        });
    }
}

/**
 * Example 4: Different exponents in action
 */
function exampleDifferentExponents() {
    console.log('\n=== Different Exponents (20 people, $100k) ===\n');
    
    const exponents = [0.8, 1.0, 1.2];
    
    exponents.forEach(exp => {
        const snapshot = harmonicDistribution(20, 100000, { exponent: exp });
        console.log(`Exponent ${exp}:`);
        console.log(`  Top: ${snapshot.metadata.topPercentage}% = $${snapshot.metadata.topPayout.toLocaleString()}`);
        console.log(`  Bottom: ${snapshot.metadata.bottomPercentage}% = $${snapshot.metadata.bottomPayout.toLocaleString()}`);
        console.log(`  Ratio: ${snapshot.metadata.topBottomRatio}x`);
        console.log(`  Gini: ${snapshot.metadata.giniCoefficient.toFixed(3)}`);
        console.log('');
    });
}

// ============================================
// RUN EXAMPLES
// ============================================

// console.log('═══════════════════════════════════════════════');
// console.log('  HARMONIC RULE DISTRIBUTION SYSTEM');
// console.log('═══════════════════════════════════════════════');

// exampleBasicDistribution();
// exampleCompareExponents();
// exampleDynamicRanking();
// exampleDifferentExponents();

// ============================================
// COMPATIBILITY EXPORTS
// ============================================

/**
 * Compatibility function for List.svelte to calculate raw harmonic percentages as fractions
 */
export function harmonicRuleDistribution(n: number = 20): { position: number; percent: number }[] {
    let H = 0;
    for (let i = 1; i <= n; i++) H += 1 / i;
    const table: { position: number; percent: number }[] = [];
    for (let i = 1; i <= n; i++) {
        const percent = (1 / i) / H;
        table.push({
            position: i,
            percent: percent
        });
    }
    return table;
}

// ============================================
// EXPORTS
// ============================================

