/**
 * Profit Distribution Calculator
 * 
 * Distributes a profit pool among participants using linear decay with
 * an adjustable top-to-bottom ratio. The higher the rank, the larger the share.
 * 
 * @packageDocumentation
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Curve preset options for quick configuration
 */
export type CurvePreset = 'flat' | 'moderate' | 'steep' | 'extreme';

/**
 * Configuration options for distribution calculation
 */
export interface DistributionOptions {
    /** Number of participants (minimum: 2, default: 20) */
    participants?: number;

    /** Total profit to distribute (default: 100000) */
    totalProfit?: number;

    /** 
     * Curve preset (ignored if topBottomRatio is provided)
     * @default 'moderate'
     */
    curve?: CurvePreset;

    /** 
     * Custom ratio between top and bottom positions (overrides curve)
     * Example: 2.5 means Rank 1 gets 2.5× more than Rank N
     * Range: 1.1 to 10.0
     */
    topBottomRatio?: number;

    /** Decimal places for percentage display (default: 2) */
    decimals?: number;

    /** Include cumulative sum in results (default: true) */
    includeCumulative?: boolean;

    /** 
     * Currency symbol for formatted output (default: '$')
     * @example '€', '£', '¥'
     */
    currencySymbol?: string;
}

/**
 * Individual distribution result for a participant
 */
export interface DistributionResult {
    /** Rank position (1 = highest) */
    rank: number;

    /** Percentage of total profit allocated (e.g., 7.50 means 7.50%) */
    percentage: number;

    /** Monetary amount allocated (e.g., 7500.00) */
    payout: number;

    /** Running total of payouts (optional) */
    cumulative?: number;

    /** Formatted percentage string (e.g., "7.50%") */
    percentageFormatted?: string;

    /** Formatted payout string (e.g., "$7,500.00") */
    payoutFormatted?: string;
}

/**
 * Summary statistics about the distribution
 */
export interface DistributionMetadata {
    /** Number of participants */
    participants: number;

    /** Total profit distributed */
    totalProfit: number;

    /** Top-to-bottom ratio used */
    topBottomRatio: number;

    /** Curve preset used (or 'custom' if ratio was provided) */
    curve: string;

    /** Percentage for Rank 1 */
    topPercentage: number;

    /** Percentage for the last rank */
    bottomPercentage: number;

    /** Payout for Rank 1 */
    topPayout: number;

    /** Payout for the last rank */
    bottomPayout: number;

    /** Average percentage across all participants */
    averagePercentage: number;

    /** Standard deviation of percentages (measure of spread) */
    standardDeviation?: number;
}

/**
 * Complete distribution response
 */
export interface DistributionResponse {
    /** Individual results for each participant */
    results: DistributionResult[];

    /** Summary statistics */
    metadata: DistributionMetadata;
}

/**
 * Simplified distribution result for quick display
 */
export interface SimpleDistributionResult {
    rank: number;
    percentage: string;
    payout: string;
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Mapping of curve presets to top-bottom ratios
 */
const CURVE_PRESETS: Record<CurvePreset, number> = {
    flat: 1.5,
    moderate: 2.5,
    steep: 4.0,
    extreme: 6.0
} as const;

/**
 * Valid range for top-bottom ratio
 */
const RATIO_MIN = 1.1;
const RATIO_MAX = 10.0;

/**
 * Default configuration values
 */
const DEFAULTS = {
    participants: 20,
    totalProfit: 100000,
    curve: 'moderate' as CurvePreset,
    decimals: 2,
    includeCumulative: true,
    currencySymbol: '$'
} as const;

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

/**
 * Calculate profit distribution using linear decay with adjustable curve
 * 
 * @param options - Configuration options
 * @returns Complete distribution with results and metadata
 * @throws {Error} If participants < 2 or ratio is outside valid range
 * 
 * @example
 * ```typescript
 * // Default distribution (20 people, moderate curve)
 * const result = calculateDistribution();
 * 
 * // Custom distribution
 * const result = calculateDistribution({
 *   participants: 15,
 *   curve: 'steep',
 *   totalProfit: 250000,
 *   currencySymbol: '€'
 * });
 * 
 * // Exact ratio control
 * const result = calculateDistribution({
 *   participants: 20,
 *   topBottomRatio: 3.0,
 *   decimals: 3
 * });
 * ```
 */
export function calculateDistribution(
    options: DistributionOptions = {}
): DistributionResponse {
    // ============================================
    // 1. MERGE OPTIONS WITH DEFAULTS
    // ============================================

    const {
        participants = DEFAULTS.participants,
        totalProfit = DEFAULTS.totalProfit,
        curve = DEFAULTS.curve,
        topBottomRatio = null,
        decimals = DEFAULTS.decimals,
        includeCumulative = DEFAULTS.includeCumulative,
        currencySymbol = DEFAULTS.currencySymbol
    } = options;

    // ============================================
    // 2. VALIDATE INPUTS
    // ============================================

    if (participants < 2) {
        throw new Error(`Participants must be at least 2 (got ${participants})`);
    }

    if (totalProfit <= 0) {
        throw new Error(`Total profit must be greater than 0 (got ${totalProfit})`);
    }

    // Determine the ratio (topBottomRatio overrides curve)
    let ratio: number;
    let usedCurve: string;

    if (topBottomRatio !== undefined && topBottomRatio !== null) {
        // Validate custom ratio
        if (topBottomRatio < RATIO_MIN || topBottomRatio > RATIO_MAX) {
            throw new Error(
                `topBottomRatio must be between ${RATIO_MIN} and ${RATIO_MAX} (got ${topBottomRatio})`
            );
        }
        ratio = topBottomRatio;
        usedCurve = 'custom';
    } else {
        // Use curve preset
        ratio = CURVE_PRESETS[curve];
        usedCurve = curve;
    }

    // ============================================
    // 3. CALCULATE DISTRIBUTION
    // ============================================

    const n = participants;

    // Formula derivation:
    // P1 = top percentage, Pn = bottom percentage
    // P1 = ratio * Pn
    // Sum of arithmetic sequence: n/2 * (P1 + Pn) = 100
    // Substitute: n/2 * (ratio*Pn + Pn) = 100
    // n/2 * Pn * (ratio + 1) = 100
    // Pn = 200 / (n * (ratio + 1))

    const bottomPercentage = 200 / (n * (ratio + 1));
    const topPercentage = bottomPercentage * ratio;
    const step = (topPercentage - bottomPercentage) / (n - 1);

    // Generate results
    const results: DistributionResult[] = [];
    let cumulative = 0;

    for (let i = 0; i < n; i++) {
        const rank = i + 1;
        const percentage = topPercentage - i * step;
        const payout = (percentage / 100) * totalProfit;
        cumulative += payout;

        // Round to specified decimal places
        const roundedPercentage = Number(percentage.toFixed(decimals));
        const roundedPayout = Number(payout.toFixed(2));

        const result: DistributionResult = {
            rank,
            percentage: roundedPercentage,
            payout: roundedPayout,
            percentageFormatted: `${roundedPercentage.toFixed(decimals)}%`,
            payoutFormatted: `${currencySymbol}${roundedPayout.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`
        };

        if (includeCumulative) {
            result.cumulative = Number(cumulative.toFixed(2));
        }

        results.push(result);
    }

    // ============================================
    // 4. FIX FLOATING POINT ACCURACY
    // ============================================

    // Ensure the sum exactly equals 100% (within tolerance)
    const sumPercentages = results.reduce((sum, r) => sum + r.percentage, 0);
    const sumPayouts = results.reduce((sum, r) => sum + r.payout, 0);

    if (Math.abs(sumPayouts - totalProfit) > 0.01) {
        // Adjust the last result to fix rounding
        const diff = totalProfit - sumPayouts;
        const lastResult = results[results.length - 1];
        lastResult.payout = Number((lastResult.payout + diff).toFixed(2));
        lastResult.percentage = Number(((lastResult.payout / totalProfit) * 100).toFixed(decimals));
        lastResult.percentageFormatted = `${lastResult.percentage.toFixed(decimals)}%`;
        lastResult.payoutFormatted = `${currencySymbol}${lastResult.payout.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

        // Recalculate cumulative if enabled
        if (includeCumulative) {
            let cumSum = 0;
            for (let i = 0; i < results.length; i++) {
                cumSum += results[i].payout;
                results[i].cumulative = Number(cumSum.toFixed(2));
            }
        }
    }

    // ============================================
    // 5. BUILD METADATA
    // ============================================

    const firstResult = results[0];
    const lastResult = results[results.length - 1];

    // Calculate average percentage
    const avgPercentage = sumPercentages / n;

    // Calculate standard deviation (sample)
    const variance = results.reduce(
        (sum, r) => sum + Math.pow(r.percentage - avgPercentage, 2),
        0
    ) / n;
    const stdDev = Number(Math.sqrt(variance).toFixed(decimals + 1));

    const metadata: DistributionMetadata = {
        participants: n,
        totalProfit,
        topBottomRatio: ratio,
        curve: usedCurve,
        topPercentage: firstResult.percentage,
        bottomPercentage: lastResult.percentage,
        topPayout: firstResult.payout,
        bottomPayout: lastResult.payout,
        averagePercentage: Number(avgPercentage.toFixed(decimals)),
        standardDeviation: stdDev
    };

    // ============================================
    // 6. RETURN RESULTS
    // ============================================

    return {
        results,
        metadata
    };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a simplified distribution for quick display
 * 
 * @param numParticipants - Number of participants
 * @param curve - Curve preset (default: 'moderate')
 * @param totalProfit - Total profit (default: 100000)
 * @param currencySymbol - Currency symbol (default: '$')
 * @returns Array of simplified results with formatted strings
 * 
 * @example
 * ```typescript
 * const simple = simpleDistribution(15, 'steep', 250000, '€');
 * console.table(simple);
 * ```
 */
export function simpleDistribution(
    numParticipants: number,
    curve: CurvePreset = 'moderate',
    totalProfit: number = 100000,
    currencySymbol: string = '$'
): SimpleDistributionResult[] {
    const result = calculateDistribution({
        participants: numParticipants,
        curve,
        totalProfit,
        currencySymbol,
        includeCumulative: false
    });

    return result.results.map((r) => ({
        rank: r.rank,
        percentage: r.percentageFormatted || `${r.percentage}%`,
        payout: r.payoutFormatted || `${currencySymbol}${r.payout.toFixed(2)}`
    }));
}

/**
 * Compare different curve presets for a given number of participants
 * 
 * @param participants - Number of participants (default: 20)
 * @param totalProfit - Total profit (default: 100000)
 * @returns Array of comparison results
 * 
 * @example
 * ```typescript
 * const comparison = compareCurves(15);
 * console.table(comparison);
 * ```
 */
export function compareCurves(
    participants: number = 20,
    totalProfit: number = 100000
): Array<{
    curve: string;
    topPercentage: number;
    midPercentage: number;
    bottomPercentage: number;
    topPayout: number;
    bottomPayout: number;
    ratio: number;
    groupTop20Percent: number;
    groupBottom20Percent: number;
}> {
    const curves: CurvePreset[] = ['flat', 'moderate', 'steep', 'extreme'];
    const topCount = Math.floor(participants * 0.2);
    const bottomCount = Math.floor(participants * 0.2);

    return curves.map((curve) => {
        const result = calculateDistribution({ participants, curve, totalProfit });
        const results = result.results;
        const midIndex = Math.floor(participants / 2);

        // Calculate top 20% group share
        const topGroupShare = results
            .slice(0, topCount)
            .reduce((sum, r) => sum + r.percentage, 0);

        // Calculate bottom 20% group share
        const bottomGroupShare = results
            .slice(-bottomCount)
            .reduce((sum, r) => sum + r.percentage, 0);

        return {
            curve,
            topPercentage: results[0].percentage,
            midPercentage: results[midIndex].percentage,
            bottomPercentage: results[participants - 1].percentage,
            topPayout: results[0].payout,
            bottomPayout: results[participants - 1].payout,
            ratio: Number((results[0].percentage / results[participants - 1].percentage).toFixed(2)),
            groupTop20Percent: Number(topGroupShare.toFixed(2)),
            groupBottom20Percent: Number(bottomGroupShare.toFixed(2))
        };
    });
}

/**
 * Find the ratio needed to achieve a desired bottom percentage
 * 
 * @param participants - Number of participants
 * @param desiredBottomPercent - Desired percentage for last place (e.g., 3.0 means 3%)
 * @returns Required ratio
 * 
 * @example
 * ```typescript
 * const ratio = findRatioForBottomPercent(20, 3.0);
 * // Returns ~2.5 (because 2.5 gives 2.86% for bottom)
 * ```
 */
export function findRatioForBottomPercent(
    participants: number,
    desiredBottomPercent: number
): number {
    if (participants < 2) {
        throw new Error('Participants must be at least 2');
    }

    if (desiredBottomPercent <= 0 || desiredBottomPercent >= 100) {
        throw new Error('Desired bottom percentage must be between 0 and 100');
    }

    // Formula: bottomPercent = 200 / (n * (ratio + 1))
    // Solve for ratio: ratio = (200 / (n * bottomPercent)) - 1
    const ratio = (200 / (participants * desiredBottomPercent)) - 1;

    // Clamp to valid range
    return Math.max(RATIO_MIN, Math.min(RATIO_MAX, ratio));
}

/**
 * Find the ratio needed to achieve a desired top percentage
 * 
 * @param participants - Number of participants
 * @param desiredTopPercent - Desired percentage for first place (e.g., 7.5 means 7.5%)
 * @returns Required ratio
 * 
 * @example
 * ```typescript
 * const ratio = findRatioForTopPercent(20, 7.5);
 * // Returns ~2.5
 * ```
 */
export function findRatioForTopPercent(
    participants: number,
    desiredTopPercent: number
): number {
    if (participants < 2) {
        throw new Error('Participants must be at least 2');
    }

    if (desiredTopPercent <= 0 || desiredTopPercent >= 100) {
        throw new Error('Desired top percentage must be between 0 and 100');
    }

    // Formula: topPercent = (200 * ratio) / (n * (ratio + 1))
    // Solve for ratio: ratio = (n * topPercent) / (200 - (n * topPercent))
    const denominator = 200 - (participants * desiredTopPercent);

    if (denominator <= 0) {
        throw new Error('Desired top percentage is too high for this number of participants');
    }

    const ratio = (participants * desiredTopPercent) / denominator;

    // Clamp to valid range
    return Math.max(RATIO_MIN, Math.min(RATIO_MAX, ratio));
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Default distribution
console.log('=== Default Distribution ===');
const defaultResult = calculateDistribution({ totalProfit: 2000 });
console.log('Metadata:', defaultResult.metadata);
/* console.log('\nFirst 5 participants:');
console.table(defaultResult.results.slice(0, 5));
console.log('\nLast 5 participants:');
console.table(defaultResult.results.slice(-5)); */
console.table(defaultResult.results);

// Example 2: Custom configuration
console.log('\n=== Custom Configuration ===');
const customResult = calculateDistribution({
    participants: 15,
    curve: 'steep',
    totalProfit: 250000,
    currencySymbol: '€',
    decimals: 3
});
console.log('Metadata:', customResult.metadata);
console.table(customResult.results);

// Example 3: Exact ratio control
console.log('\n=== Exact Ratio Control ===');
const exactResult = calculateDistribution({
    participants: 20,
    topBottomRatio: 3.0,
    totalProfit: 100000
});
console.log(`Top: ${exactResult.metadata.topPercentage}%, Bottom: ${exactResult.metadata.bottomPercentage}%`);
console.log(`Ratio: ${(exactResult.metadata.topPercentage / exactResult.metadata.bottomPercentage).toFixed(2)}x`);

// Example 4: Compare curves
console.log('\n=== Curve Comparison (20 people) ===');
const comparison = compareCurves(20);
console.table(comparison);

// Example 5: Simple distribution
console.log('\n=== Simple Distribution ===');
console.table(simpleDistribution(10, 'flat', 50000));

// Example 6: Find ratio for target bottom percentage
console.log('\n=== Find Ratio for 3% Bottom ===');
const ratioFor3Percent = findRatioForBottomPercent(20, 3.0);
console.log(`Ratio needed for 3% bottom: ${ratioFor3Percent.toFixed(2)}x`);
const testResult = calculateDistribution({
    participants: 20,
    topBottomRatio: ratioFor3Percent
});
console.log(`Actual bottom: ${testResult.metadata.bottomPercentage}%`);

// Example 7: Error handling
try {
    const invalid = calculateDistribution({ participants: 1 });
} catch (error) {
    if (error instanceof Error) {
        console.log('\n✅ Caught expected error:', error.message);
    }
}

// Example 8: Async usage pattern
async function demonstrateAsyncUsage(): Promise<void> {
    const configs: DistributionOptions[] = [
        { participants: 10, curve: 'flat' },
        { participants: 15, curve: 'moderate' },
        { participants: 20, curve: 'steep' },
        { participants: 25, curve: 'extreme' }
    ];

    const promises = configs.map((config) =>
        Promise.resolve(calculateDistribution(config))
    );

    const results = await Promise.all(promises);

    results.forEach((result, index) => {
        const { metadata } = result;
        console.log(
            `Config ${index + 1}: ${metadata.participants} participants, ${metadata.curve} curve`
        );
        console.log(
            `  Top: ${metadata.topPercentage}%, Bottom: ${metadata.bottomPercentage}%`
        );
        console.log(`  Ratio: ${metadata.topBottomRatio}x`);
    });
}

// Uncomment to run:
// demonstrateAsyncUsage();

// ============================================
// EXPORTS
// ============================================

export default {
    calculateDistribution,
    simpleDistribution,
    compareCurves,
    findRatioForBottomPercent,
    findRatioForTopPercent
};