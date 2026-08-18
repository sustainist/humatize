/**
 * Compare different distribution models
 */
function compareModels(participants: number = 20, totalProfit: number = 100000) {
    console.log('=== Distribution Model Comparison ===\n');
    
    // Define models to compare
    const models = [
        { name: 'Perfect Equality', type: 'equal' },
        { name: 'Zipf (s=0.2) - Very Flat', type: 'zipf', exponent: 0.2 },
        { name: 'Linear (2.5x) - Balanced', type: 'linear' },
        { name: 'Zipf (s=1.0) - Harmonic', type: 'zipf', exponent: 1.0 },
        { name: 'Pareto (80/20)', type: 'pareto' },
        { name: 'Zipf (s=2.0) - Extreme', type: 'zipf', exponent: 2.0 }
    ];

    // Calculate each model
    const results = models.map(model => {
        let distribution: number[];
        
        if (model.type === 'equal') {
            distribution = Array(participants).fill(100 / participants);
        } else if (model.type === 'linear') {
            distribution = linearDistribution(participants, 2.5);
        } else if (model.type === 'pareto') {
            distribution = paretoDistribution(participants);
        } else if (model.type === 'zipf' && model.exponent) {
            distribution = zipfDistribution(participants, model.exponent);
        } else {
            distribution = [];
        }
        
        // Calculate metrics
        const sorted = [...distribution].sort((a, b) => b - a);
        const top20 = Math.floor(participants * 0.2);
        const bottom20 = Math.floor(participants * 0.2);
        
        const top20Share = sorted.slice(0, top20).reduce((s, v) => s + v, 0);
        const bottom20Share = sorted.slice(-bottom20).reduce((s, v) => s + v, 0);
        const ratio = sorted[0] / sorted[sorted.length - 1];
        const gini = calculateGini(sorted);
        
        return {
            name: model.name,
            top20: Number(top20Share.toFixed(1)),
            bottom20: Number(bottom20Share.toFixed(1)),
            topPercent: Number(sorted[0].toFixed(2)),
            bottomPercent: Number(sorted[sorted.length - 1].toFixed(2)),
            ratio: Number(ratio.toFixed(1)),
            gini: Number(gini.toFixed(3))
        };
    });

    // Display results
    console.log('Model                | Top20% | Bottom20% | Top% | Bottom% | Ratio | Gini');
    console.log('---------------------|--------|-----------|------|---------|-------|------');
    
    results.forEach(r => {
        console.log(
            `${r.name.padEnd(20)} | ` +
            `${String(r.top20).padStart(6)}% | ` +
            `${String(r.bottom20).padStart(9)}% | ` +
            `${String(r.topPercent).padStart(4)}% | ` +
            `${String(r.bottomPercent).padStart(7)}% | ` +
            `${String(r.ratio).padStart(5)}x | ` +
            `${r.gini.toFixed(3)}`
        );
    });
}

function linearDistribution(n: number, ratio: number): number[] {
    const bottom = 200 / (n * (ratio + 1));
    const top = bottom * ratio;
    const step = (top - bottom) / (n - 1);
    return Array.from({ length: n }, (_, i) => top - i * step);
}

function zipfDistribution(n: number, exponent: number): number[] {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += 1 / Math.pow(i, exponent);
    }
    return Array.from({ length: n }, (_, i) => 
        (1 / Math.pow(i + 1, exponent)) / sum * 100
    );
}

function paretoDistribution(n: number): number[] {
    // Approximate 80/20 distribution
    const top20 = Math.floor(n * 0.2);
    const bottom80 = n - top20;
    
    const result: number[] = [];
    let remaining = 100;
    
    // Top 20% get 80%
    for (let i = 0; i < top20; i++) {
        const share = (80 / top20) * (1 - i / top20 * 0.5);
        result.push(share);
        remaining -= share;
    }
    
    // Bottom 80% get 20%
    for (let i = 0; i < bottom80; i++) {
        const share = (remaining / bottom80) * (1 + i / bottom80 * 0.5);
        result.push(share);
        remaining -= share;
    }
    
    return result;
}

function calculateGini(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((s, v) => s + v, 0);
    if (sum === 0) return 0;
    let numerator = 0;
    for (let i = 0; i < n; i++) {
        numerator += sorted[i] * (i + 1);
    }
    return Math.max(0, Math.min(1, (2 * numerator) / (n * sum) - (n + 1) / n));
}

// Run the comparison
compareModels(20, 100000);