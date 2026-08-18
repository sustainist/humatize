/**
 * Dynamic Ranking System with Zipf Distribution
 * 
 * People negotiate SLOTS (positions), math determines PERCENTAGES
 * Future-proof: works for 2 to 10,000+ participants
 * 
 * Features:
 * - O(1) access by position (array)
 * - O(1) access by ID (Map)
 * - O(1) position lookup by ID (reverse Map)
 * - Cached distributions for frequent access
 * - Full error handling with custom errors
 * - Export/Import for persistence
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
    /** Additional metadata */
    metadata?: Record<string, any>;
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
    participantId: string;
    participantName: string;
    percentage: number;
    payout: number;
    cumulative?: number;
    percentageFormatted?: string;
    payoutFormatted?: string;
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
        harmonicSum: number;
        topPercentage: number;
        bottomPercentage: number;
        topPayout: number;
        bottomPayout: number;
        topBottomRatio: number;
        giniCoefficient: number;
        averagePercentage: number;
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
    /** Participants whose slots changed */
    affectedParticipants: Array<{
        id: string;
        oldSlot: number;
        newSlot: number;
    }>;
    message: string;
    newSnapshot: RankingSnapshot;
}

/**
 * Result of moving a participant
 */
export interface MoveResult {
    success: boolean;
    message: string;
    affectedParticipants: string[];
    oldSlot?: number;
    newSlot?: number;
}

/**
 * Result of swapping participants
 */
export interface SwapResult {
    success: boolean;
    message: string;
}

/**
 * Result of removing a participant
 */
export interface RemoveResult {
    success: boolean;
    message: string;
    affectedParticipants: string[];
    removedParticipant?: Participant;
}

/**
 * Exported state for persistence
 */
export interface ExportedState {
    participants: Participant[];
    config: RankingConfig;
    nextId: number;
    timestamp: string;
}

// ============================================
// ERROR CLASS
// ============================================

export class RankingError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'RankingError';
    }
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

        // Validate exponent
        if (exponent < 0.0 || exponent > 3.0) {
            throw new RankingError(
                `Exponent must be between 0.0 and 3.0 (got ${exponent})`,
                'INVALID_EXPONENT'
            );
        }

        // Calculate raw Zipf weights
        const weights: number[] = [];
        let sumWeights = 0;

        for (let i = 1; i <= totalSlots; i++) {
            const weight = 1 / Math.pow(i, exponent);
            weights.push(weight);
            sumWeights += weight;
        }

        // Convert to percentages and apply minimum percentage floor
        let percentages: number[] = [];
        if (minPercentage > 0) {
            const totalMin = minPercentage * totalSlots;

            if (totalMin >= 100) {
                percentages = Array(totalSlots).fill(100 / totalSlots);
            } else {
                percentages = weights.map(w => (w / sumWeights) * 100);
                const allocated = new Set<number>();
                let changed = true;
                while (changed) {
                    changed = false;
                    let fixedSum = 0;
                    let activeWeightSum = 0;
                    for (let i = 0; i < totalSlots; i++) {
                        if (allocated.has(i)) {
                            fixedSum += minPercentage;
                        } else {
                            activeWeightSum += weights[i];
                        }
                    }

                    const remainingPercentage = 100 - fixedSum;
                    for (let i = 0; i < totalSlots; i++) {
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
        } else {
            percentages = weights.map(w => (w / sumWeights) * 100);
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

    /**
     * Calculate Gini coefficient (0 = perfect equality, 1 = perfect inequality)
     */
    static calculateGini(values: number[]): number {
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

    /**
     * Find the exponent needed to achieve a specific top X% share
     */
    static findExponentForGroupShare(
        participants: number,
        topPercent: number,
        targetShare: number,
        tolerance: number = 0.5
    ): number {
        if (participants < 2) {
            throw new RankingError('Participants must be at least 2', 'INVALID_PARTICIPANTS');
        }
        
        if (topPercent <= 0 || topPercent > 100) {
            throw new RankingError('topPercent must be between 0 and 100', 'INVALID_PERCENT');
        }
        
        if (targetShare <= 0 || targetShare > 100) {
            throw new RankingError('targetShare must be between 0 and 100', 'INVALID_SHARE');
        }
        
        let low = 0.0;
        let high = 3.0;
        let iterations = 0;
        const maxIterations = 100;
        
        while (iterations < maxIterations) {
            iterations++;
            const mid = (low + high) / 2;
            
            const percentages = this.calculate(participants, mid);
            const topCount = Math.max(1, Math.floor(participants * (topPercent / 100)));
            let groupShare = 0;
            
            for (let i = 0; i < topCount; i++) {
                groupShare += percentages[i];
            }
            
            if (Math.abs(groupShare - targetShare) < tolerance) {
                return Number(mid.toFixed(3));
            }
            
            if (groupShare < targetShare) {
                low = mid;
            } else {
                high = mid;
            }
        }
        
        return Number(((low + high) / 2).toFixed(3));
    }
}

// ============================================
// DYNAMIC RANKING SYSTEM
// ============================================

/**
 * Main ranking system with slot-based negotiation
 * Uses efficient data structures for O(1) access
 */
export class RankingSystem {
    // Primary data structures
    private participantsById: Map<string, Participant> = new Map();
    private participantsBySlot: Participant[] = [];
    private slotById: Map<string, number> = new Map();
    private config: Required<RankingConfig>;
    private nextId: number = 1;
    
    // Cache
    private distributionCache: RankingSnapshot | null = null;
    private cacheVersion: number = 0;

    constructor(config: RankingConfig) {
        this.config = {
            zipfExponent: config.zipfExponent ?? 1.0,
            minPercentage: config.minPercentage ?? 0.01,
            totalProfit: config.totalProfit,
            currencySymbol: config.currencySymbol ?? '$',
            decimals: config.decimals ?? 2
        };
    }

    // ============================================
    // BASIC OPERATIONS - O(1)
    // ============================================

    /**
     * Add a new participant to the end of the list - O(1)
     */
    addParticipant(name: string, metadata?: Record<string, any>): Participant {
        const id = `p${this.nextId++}`;
        const slot = this.participantsBySlot.length + 1;

        const participant: Participant = {
            id,
            name,
            slot,
            version: 1,
            lastNegotiated: new Date(),
            lastNegotiator: 'system',
            metadata
        };

        // Add to all data structures - O(1)
        this.participantsById.set(id, participant);
        this.participantsBySlot.push(participant);
        this.slotById.set(id, this.participantsBySlot.length - 1);

        // Invalidate cache
        this.invalidateCache();

        return participant;
    }

    /**
     * Get participant by ID - O(1)
     */
    getParticipantById(id: string): Participant | null {
        return this.participantsById.get(id) || null;
    }

    /**
     * Get participant by slot/position - O(1)
     * @param slot - 1-based position (1 = highest)
     */
    getParticipantBySlot(slot: number): Participant | null {
        const index = slot - 1;
        if (index < 0 || index >= this.participantsBySlot.length) {
            return null;
        }
        return this.participantsBySlot[index] || null;
    }

    /**
     * Get the current slot of a participant - O(1)
     */
    getSlot(id: string): number | null {
        const slot = this.slotById.get(id);
        return slot !== undefined ? slot + 1 : null;
    }

    /**
     * Get all participants in order - O(1)
     */
    getParticipantsInOrder(): Participant[] {
        return [...this.participantsBySlot];
    }

    /**
     * Get total number of participants - O(1)
     */
    get totalParticipants(): number {
        return this.participantsBySlot.length;
    }

    /**
     * Check if a participant exists - O(1)
     */
    hasParticipant(id: string): boolean {
        return this.participantsById.has(id);
    }

    // ============================================
    // DISTRIBUTION ACCESS
    // ============================================

    /**
     * Get the current distribution using Zipf's Law - O(n)
     */
    getDistribution(): RankingSnapshot {
        return this.createSnapshot();
    }

    /**
     * Get distribution for a specific slot - O(1) with cache
     */
    getSlotDistribution(slot: number): SlotDistribution | null {
        this.ensureCache();
        
        const index = slot - 1;
        if (index < 0 || index >= (this.distributionCache?.distributions.length || 0)) {
            return null;
        }
        
        return this.distributionCache?.distributions[index] || null;
    }

    /**
     * Get distribution for a specific participant - O(1)
     */
    getParticipantDistribution(id: string): SlotDistribution | null {
        const slot = this.getSlot(id);
        if (slot === null) return null;
        return this.getSlotDistribution(slot);
    }

    /**
     * Get cached snapshot - O(1) after first call
     */
    private ensureCache(): void {
        const currentVersion = this.getVersion();
        
        if (currentVersion !== this.cacheVersion || this.distributionCache === null) {
            this.distributionCache = this.createSnapshot();
            this.cacheVersion = currentVersion;
        }
    }

    /**
     * Get current version for cache invalidation
     */
    private getVersion(): number {
        return this.participantsBySlot.reduce((sum, p) => sum + p.version, 0);
    }

    /**
     * Invalidate cache when data changes
     */
    private invalidateCache(): void {
        this.distributionCache = null;
        this.cacheVersion = 0;
    }

    // ============================================
    // MODIFICATION OPERATIONS
    // ============================================

    /**
     * Negotiate a new slot for a participant - O(n)
     * This is the core operation: person wants slot X, others get shifted
     */
    negotiateSlot(
        participantId: string,
        desiredSlot: number,
        negotiator: string = 'system'
    ): NegotiationResult {
        // Validate participant exists
        const participant = this.participantsById.get(participantId);
        if (!participant) {
            return this.createFailedResult(
                participantId,
                desiredSlot,
                `Participant ${participantId} not found`
            );
        }

        const totalSlots = this.participantsBySlot.length;
        if (desiredSlot < 1 || desiredSlot > totalSlots) {
            return this.createFailedResult(
                participantId,
                desiredSlot,
                `Slot must be between 1 and ${totalSlots} (got ${desiredSlot})`
            );
        }

        const currentSlot = this.slotById.get(participantId)!;
        const oldSlot = currentSlot + 1;
        const targetIndex = desiredSlot - 1;

        // If same slot, no change needed
        if (currentSlot === targetIndex) {
            return this.createSuccessResult(
                participantId,
                desiredSlot,
                oldSlot,
                [],
                'Slot unchanged',
                this.createSnapshot()
            );
        }

        const affected: Array<{ id: string; oldSlot: number; newSlot: number }> = [];

        // Remove from current position
        const [moving] = this.participantsBySlot.splice(currentSlot, 1);

        // Insert at target position
        this.participantsBySlot.splice(targetIndex, 0, moving);

        // Update slot mapping for all affected participants
        const start = Math.min(currentSlot, targetIndex);
        const end = Math.max(currentSlot, targetIndex);

        for (let i = start; i <= end; i++) {
            const p = this.participantsBySlot[i];
            if (p.id === participantId) continue;

            const oldSlotForP = this.slotById.get(p.id)!;
            this.slotById.set(p.id, i);
            p.slot = i + 1;
            p.version++;
            p.lastNegotiated = new Date();
            p.lastNegotiator = negotiator;

            affected.push({
                id: p.id,
                oldSlot: oldSlotForP + 1,
                newSlot: i + 1
            });
        }

        // Update moving participant
        moving.slot = desiredSlot;
        moving.version++;
        moving.lastNegotiated = new Date();
        moving.lastNegotiator = negotiator;
        this.slotById.set(participantId, targetIndex);

        // Invalidate cache
        this.invalidateCache();

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
     * Swap two participants - O(1)
     */
    swapSlots(id1: string, id2: string): SwapResult {
        const slot1 = this.slotById.get(id1);
        const slot2 = this.slotById.get(id2);
        
        if (slot1 === undefined || slot2 === undefined) {
            return {
                success: false,
                message: 'One or both participants not found'
            };
        }
        
        if (slot1 === slot2) {
            return {
                success: true,
                message: 'Participants are already in the same slot'
            };
        }
        
        // Swap in array - O(1)
        [this.participantsBySlot[slot1], this.participantsBySlot[slot2]] = 
        [this.participantsBySlot[slot2], this.participantsBySlot[slot1]];
        
        // Update slot mapping - O(1)
        this.slotById.set(id1, slot2);
        this.slotById.set(id2, slot1);
        
        // Update participant objects
        this.participantsBySlot[slot1].slot = slot1 + 1;
        this.participantsBySlot[slot2].slot = slot2 + 1;
        this.participantsBySlot[slot1].version++;
        this.participantsBySlot[slot2].version++;
        this.participantsBySlot[slot1].lastNegotiated = new Date();
        this.participantsBySlot[slot2].lastNegotiated = new Date();
        
        // Invalidate cache
        this.invalidateCache();
        
        return {
            success: true,
            message: `Swapped participants at slots ${slot1 + 1} and ${slot2 + 1}`
        };
    }

    /**
     * Remove a participant - O(n)
     */
    removeParticipant(id: string): RemoveResult {
        const slot = this.slotById.get(id);
        if (slot === undefined) {
            return {
                success: false,
                message: `Participant ${id} not found`,
                affectedParticipants: []
            };
        }
        
        const participant = this.participantsBySlot[slot];
        
        // Remove from array - O(n)
        this.participantsBySlot.splice(slot, 1);
        
        // Remove from maps - O(1)
        this.participantsById.delete(id);
        this.slotById.delete(id);
        
        // Update slot mapping for participants below - O(k)
        const affected: string[] = [];
        for (let i = slot; i < this.participantsBySlot.length; i++) {
            const p = this.participantsBySlot[i];
            this.slotById.set(p.id, i);
            p.slot = i + 1;
            p.version++;
            p.lastNegotiated = new Date();
            affected.push(p.id);
        }
        
        // Invalidate cache
        this.invalidateCache();
        
        return {
            success: true,
            message: `Removed ${participant.name}`,
            affectedParticipants: affected,
            removedParticipant: participant
        };
    }

    /**
     * Update participant name - O(1)
     */
    updateParticipantName(id: string, newName: string): boolean {
        const participant = this.participantsById.get(id);
        if (!participant) return false;
        
        participant.name = newName;
        participant.version++;
        participant.lastNegotiated = new Date();
        this.invalidateCache();
        
        return true;
    }

    /**
     * Update participant metadata - O(1)
     */
    updateParticipantMetadata(id: string, metadata: Record<string, any>): boolean {
        const participant = this.participantsById.get(id);
        if (!participant) return false;
        
        participant.metadata = { ...participant.metadata, ...metadata };
        participant.version++;
        participant.lastNegotiated = new Date();
        this.invalidateCache();
        
        return true;
    }

    // ============================================
    // BATCH OPERATIONS
    // ============================================

    /**
     * Add multiple participants - O(n)
     */
    addParticipants(names: string[]): Participant[] {
        const results: Participant[] = [];
        for (const name of names) {
            results.push(this.addParticipant(name));
        }
        return results;
    }

    /**
     * Clear all participants - O(1)
     */
    clear(): void {
        this.participantsById.clear();
        this.participantsBySlot = [];
        this.slotById.clear();
        this.nextId = 1;
        this.invalidateCache();
    }

    /**
     * Get all participant IDs - O(n)
     */
    getAllIds(): string[] {
        return Array.from(this.participantsById.keys());
    }

    // ============================================
    // SEARCH OPERATIONS
    // ============================================

    /**
     * Find participants by name (case-insensitive partial match) - O(n)
     */
    findByName(searchTerm: string): Participant[] {
        const term = searchTerm.toLowerCase();
        return this.participantsBySlot.filter(p => 
            p.name.toLowerCase().includes(term)
        );
    }

    /**
     * Get participants in a range of slots - O(k) where k is range size
     */
    getParticipantsInRange(startSlot: number, endSlot: number): Participant[] {
        const start = Math.max(0, startSlot - 1);
        const end = Math.min(this.participantsBySlot.length, endSlot);
        
        if (start >= end) return [];
        return this.participantsBySlot.slice(start, end);
    }

    // ============================================
    // SNAPSHOT & PERSISTENCE
    // ============================================

    /**
     * Export current state for persistence - O(n)
     */
    exportState(): ExportedState {
        return {
            participants: this.participantsBySlot,
            config: { ...this.config },
            nextId: this.nextId,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import state from persistence - O(n)
     */
    importState(state: ExportedState): void {
        this.clear();
        this.config = { ...this.config, ...state.config };
        this.nextId = state.nextId;
        
        for (const participant of state.participants) {
            this.participantsById.set(participant.id, participant);
            this.participantsBySlot.push(participant);
            this.slotById.set(participant.id, this.participantsBySlot.length - 1);
        }
        
        this.invalidateCache();
    }

    // ============================================
    // PRIVATE METHODS
    // ============================================

    /**
     * Calculate percentages using Zipf distribution
     */
    private calculateDistribution(): number[] {
        const total = this.participantsBySlot.length;
        if (total === 0) return [];
        
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
        const ordered = this.participantsBySlot;
        const total = ordered.length;
        const { totalProfit, decimals = 2, currencySymbol = '$' } = this.config;
        
        if (total === 0) {
            return {
                participants: [],
                distributions: [],
                totalProfit,
                metadata: {
                    totalParticipants: 0,
                    zipfExponent: this.config.zipfExponent,
                    harmonicSum: 0,
                    topPercentage: 0,
                    bottomPercentage: 0,
                    topPayout: 0,
                    bottomPayout: 0,
                    topBottomRatio: 0,
                    giniCoefficient: 0,
                    averagePercentage: 0,
                    averageAdjacentGap: 0
                }
            };
        }

        const percentages = this.calculateDistribution();
        const distributions: SlotDistribution[] = [];
        let cumulative = 0;

        for (let i = 0; i < total; i++) {
            const pct = percentages[i] || 0;
            const payout = (pct / 100) * totalProfit;
            cumulative += payout;
            const participant = ordered[i];

            distributions.push({
                slot: i + 1,
                participantId: participant.id,
                participantName: participant.name,
                percentage: Number(pct.toFixed(decimals)),
                payout: Number(payout.toFixed(2)),
                cumulative: Number(cumulative.toFixed(2)),
                percentageFormatted: `${pct.toFixed(decimals)}%`,
                payoutFormatted: `${currencySymbol}${payout.toFixed(2)}`
            });
        }

        // Calculate metadata
        const topPct = distributions[0]?.percentage || 0;
        const bottomPct = distributions[total - 1]?.percentage || 0;
        const topPayout = distributions[0]?.payout || 0;
        const bottomPayout = distributions[total - 1]?.payout || 0;
        const avgPct = distributions.reduce((sum, d) => sum + d.percentage, 0) / total;

        // Average adjacent gap
        let totalGap = 0;
        for (let i = 0; i < total - 1; i++) {
            totalGap += distributions[i].percentage - distributions[i + 1].percentage;
        }
        const avgGap = total > 1 ? totalGap / (total - 1) : 0;

        // Gini coefficient
        const gini = ZipfDistribution.calculateGini(
            distributions.map(d => d.percentage)
        );

        // Harmonic sum
        let harmonicSum = 0;
        for (let i = 1; i <= total; i++) {
            harmonicSum += 1 / Math.pow(i, this.config.zipfExponent);
        }

        return {
            participants: ordered,
            distributions,
            totalProfit,
            metadata: {
                totalParticipants: total,
                zipfExponent: this.config.zipfExponent,
                harmonicSum: Number(harmonicSum.toFixed(6)),
                topPercentage: topPct,
                bottomPercentage: bottomPct,
                topPayout,
                bottomPayout,
                topBottomRatio: Number((topPct / bottomPct).toFixed(2)),
                giniCoefficient: Number(gini.toFixed(4)),
                averagePercentage: Number(avgPct.toFixed(decimals)),
                averageAdjacentGap: Number(avgGap.toFixed(decimals))
            }
        };
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
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Quick function to get Zipf distribution
 */
export function zipfsLaw({
    participants,
    profit,
    exponent = 1.0,
    decimals = 2,
    minPercentage = 0.01,
    currencySymbol = '$'
}: {
    participants: number,
    profit: number,
    exponent?: number,
    decimals?: number,
    minPercentage?: number,
    currencySymbol?: string
}): RankingSnapshot {
    const system = new RankingSystem({
        totalProfit: profit,
        zipfExponent: exponent,
        currencySymbol: currencySymbol,
        decimals: decimals,
        minPercentage: minPercentage
    });
    
    for (let i = 1; i <= participants; i++) {
        system.addParticipant(`Person ${i}`);
    }

    return system.getDistribution();
}

/**
 * Format a distribution snapshot for display
 */
export function formatDistribution(snapshot: RankingSnapshot): string {
    const { metadata, distributions, totalProfit } = snapshot;
    const lines = [
        '═══════════════════════════════════════════════════════════════',
        '  ZIPF DISTRIBUTION SUMMARY',
        '═══════════════════════════════════════════════════════════════',
        `  Participants: ${metadata.totalParticipants}`,
        `  Total Profit: $${totalProfit.toLocaleString()}`,
        `  Exponent: ${metadata.zipfExponent}`,
        `  Harmonic Sum: ${metadata.harmonicSum.toFixed(4)}`,
        `  Gini Coefficient: ${metadata.giniCoefficient}`,
        '',
        `  Top: ${metadata.topPercentage}% = $${metadata.topPayout.toLocaleString()}`,
        `  Bottom: ${metadata.bottomPercentage}% = $${metadata.bottomPayout.toLocaleString()}`,
        `  Top/Bottom Ratio: ${metadata.topBottomRatio}x`,
        `  Average Percentage: ${metadata.averagePercentage}%`,
        '',
        '  Top 5:'
    ];

    distributions.slice(0, 5).forEach(d => {
        lines.push(`    ${d.slot}. ${d.participantName}: ${d.percentage}% = $${d.payout.toLocaleString()}`);
    });

    if (distributions.length > 10) {
        lines.push('  ...');
        const last = distributions[distributions.length - 1];
        lines.push(`  Bottom: ${last.participantName}: ${last.percentage}% = $${last.payout.toLocaleString()}`);
    }

    lines.push('═══════════════════════════════════════════════════════════════');
    return lines.join('\n');
}

// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * Example 1: Basic usage with 20 participants
 */
export function exampleBasicUsage() {
    const system = new RankingSystem({
        totalProfit: 100000,
        zipfExponent: 1.0,
        currencySymbol: '$'
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
    console.log(`Ratio: ${snapshot.metadata.topBottomRatio}x`);
    console.log(`Gini: ${snapshot.metadata.giniCoefficient}`);
    console.log(`Average gap: ${snapshot.metadata.averageAdjacentGap}%\n`);

    // Show top 5
    console.log('Top 5:');
    snapshot.distributions.slice(0, 5).forEach(d => {
        console.log(`  Slot ${d.slot}: ${d.percentage}% = $${d.payout.toLocaleString()}`);
    });

    console.log('\nBottom 5:');
    snapshot.distributions.slice(-5).forEach(d => {
        console.log(`  Slot ${d.slot}: ${d.percentage}% = $${d.payout.toLocaleString()}`);
    });

    return snapshot;
}

/**
 * Example 2: Slot negotiation
 */
export function exampleNegotiation() {
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
        console.log(`  ${d.participantName}: ${d.percentage}%`);
    });

    // Person 10 wants slot 3
    const person10 = system.getParticipantBySlot(10);
    console.log(`\n${person10?.name} negotiates for slot 3...`);

    const result = system.negotiateSlot(person10!.id, 3, person10!.name);

    if (result.success) {
        console.log(`✓ Success! ${person10?.name} moved from ${result.oldSlot} to ${result.newSlot}`);
        console.log(`Affected: ${result.affectedParticipants.length} people pushed down`);

        console.log('\nNew Top 3:');
        result.newSnapshot.distributions.slice(0, 3).forEach(d => {
            console.log(`  ${d.participantName}: ${d.percentage}%`);
        });
    }
}

/**
 * Example 3: Compare exponents
 */
export function exampleCompareExponents() {
    const totalProfit = 100000;
    const participants = 20;

    console.log('=== Comparing Zipf Exponents (20 people) ===\n');

    [0.2, 0.5, 0.8, 1.0, 1.2, 1.5].forEach(exponent => {
        const snapshot = zipfsLaw({
            participants,
            profit: totalProfit,
            exponent
        });

        const { topPercentage, bottomPercentage, topBottomRatio, giniCoefficient } = snapshot.metadata;

        console.log(`Exponent ${exponent}:`);
        console.log(`  Top: ${topPercentage}%, Bottom: ${bottomPercentage}%`);
        console.log(`  Ratio: ${topBottomRatio}x`);
        console.log(`  Gini: ${giniCoefficient}`);
        console.log(`  Top 3 share: ${snapshot.distributions.slice(0, 3).reduce((s, d) => s + d.percentage, 0).toFixed(1)}%`);
        console.log('');
    });
}

/**
 * Example 4: O(1) access patterns
 */
export function exampleEfficientAccess() {
    const system = new RankingSystem({
        totalProfit: 100000,
        zipfExponent: 0.2
    });

    // Add 20 participants
    for (let i = 1; i <= 20; i++) {
        system.addParticipant(`Person ${i}`);
    }

    console.log('=== Efficient Access Examples ===\n');

    // O(1) access by position
    console.log('1. O(1) Get participant by slot:');
    const p5 = system.getParticipantBySlot(5);
    console.log(`   Slot 5: ${p5?.name}`);

    // O(1) access by ID
    console.log('\n2. O(1) Get participant by ID:');
    const p1 = system.getParticipantById('p1');
    console.log(`   p1: ${p1?.name}`);

    // O(1) get slot of a participant
    console.log('\n3. O(1) Get slot by ID:');
    const slot = system.getSlot('p3');
    console.log(`   p3 is at slot ${slot}`);

    // O(1) get distribution for a specific slot (cached)
    console.log('\n4. O(1) Get distribution by slot (cached):');
    const dist = system.getSlotDistribution(10);
    if (dist) {
        console.log(`   ${dist.participantName}: ${dist.percentage}% = $${dist.payout}`);
    }

    // O(1) swap two participants
    console.log('\n5. O(1) Swap slots:');
    const swapResult = system.swapSlots('p1', 'p20');
    console.log(`   ${swapResult.message}`);
    console.log(`   New slot 1: ${system.getParticipantBySlot(1)?.name}`);
    console.log(`   New slot 20: ${system.getParticipantBySlot(20)?.name}`);
}

/**
 * Example 5: Find exponent for specific distribution
 */
export function exampleFindExponent() {
    console.log('=== Finding Exponents ===\n');

    const scenarios = [
        { name: '20/80 (Reverse Pareto)', targetShare: 20 },
        { name: '40/60 (Balanced)', targetShare: 40 },
        { name: '50/50 (Equalish)', targetShare: 50 },
        { name: '60/40 (Moderate)', targetShare: 60 },
        { name: '80/20 (Pareto)', targetShare: 80 }
    ];

    scenarios.forEach(scenario => {
        const exponent = ZipfDistribution.findExponentForGroupShare(20, 20, scenario.targetShare);
        console.log(`${scenario.name}: s = ${exponent}`);
    });
}

// ============================================
// RUN EXAMPLES
// ============================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('  ZIPF DISTRIBUTION RANKING SYSTEM WITH EFFICIENT ACCESS');
console.log('═══════════════════════════════════════════════════════════════\n');

// Run examples
exampleBasicUsage();
console.log('\n' + '='.repeat(60) + '\n');
exampleNegotiation();
console.log('\n' + '='.repeat(60) + '\n');
exampleCompareExponents();
console.log('\n' + '='.repeat(60) + '\n');
exampleEfficientAccess();
console.log('\n' + '='.repeat(60) + '\n');
exampleFindExponent();
