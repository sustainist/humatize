<script lang="ts">
    import { ZipfDistribution } from "../../sustainableDistribution/distributionZipfLaw";

    const {
        zipfsLawExponent,
        participants,
    }: { zipfsLawExponent: number; participants: number } = $props();

    let percentages = $derived.by(() => {
        try {
            if (participants <= 0) return [];
            const exp = Math.min(Math.max(0, zipfsLawExponent), 100);
            return ZipfDistribution.calculate(participants, exp);
        } catch (e) {
            console.error(e);
            return [];
        }
    });

    let maxPercentage = $derived(
        percentages.length > 0 ? Math.max(...percentages) : 100,
    );

    let points = $derived.by(() => {
        const w = 600;
        const h = 300;
        const margin = { top: 20, right: 30, bottom: 40, left: 70 };
        const innerWidth = w - margin.left - margin.right;
        const innerHeight = h - margin.top - margin.bottom;

        if (percentages.length === 0) {
            return {
                path: "",
                areaPath: "",
                dots: [],
                margin,
                w,
                h,
                innerWidth,
                innerHeight,
            };
        }

        const dots = percentages.map((pct, idx) => {
            const rank = idx + 1;
            const x = margin.left + (pct / maxPercentage) * innerWidth;
            const y =
                margin.top +
                (percentages.length > 1
                    ? ((rank - 1) / (percentages.length - 1)) * innerHeight
                    : innerHeight / 2);
            return { x, y, rank, percentage: pct };
        });

        const path =
            dots.length > 0
                ? `M ${dots[0].x} ${dots[0].y} ` +
                  dots
                      .slice(1)
                      .map((d) => `L ${d.x} ${d.y}`)
                      .join(" ")
                : "";

        const areaPath =
            dots.length > 0
                ? `${path} L ${margin.left} ${dots[dots.length - 1].y} L ${margin.left} ${dots[0].y} Z`
                : "";

        return {
            path,
            areaPath,
            dots,
            margin,
            w,
            h,
            innerWidth,
            innerHeight,
        };
    });

    let hoverIndex = $state<number | null>(null);

    function handleMouseMove(e: MouseEvent) {
        const svg = e.currentTarget as SVGSVGElement;
        const rect = svg.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;

        if (!points.dots || points.dots.length === 0) return;

        let closestIdx = 0;
        let minDist = Infinity;

        points.dots.forEach((dot, idx) => {
            const dist = Math.abs(dot.y - mouseY);
            if (dist < minDist) {
                minDist = dist;
                closestIdx = idx;
            }
        });

        hoverIndex = closestIdx;
    }

    function handleMouseLeave() {
        hoverIndex = null;
    }

    let yTicks = $derived.by(() => {
        const { dots } = points;
        if (!dots || dots.length === 0) return [];

        const ticksCount = Math.min(5, dots.length);
        const ticks = [];
        for (let i = 0; i < ticksCount; i++) {
            const idx = Math.round((i * (dots.length - 1)) / (ticksCount - 1));
            const d = dots[idx];
            if (d) {
                ticks.push({
                    y: d.y,
                    label: `Rank ${d.rank}`,
                });
            }
        }
        return ticks;
    });

    let xTicks = $derived.by(() => {
        const { margin, innerWidth } = points;
        const ticksCount = 5;
        const ticks = [];
        for (let i = 0; i <= ticksCount; i++) {
            const pct = (i / ticksCount) * maxPercentage;
            const x = margin.left + (i / ticksCount) * innerWidth;
            ticks.push({
                x,
                label: `${pct.toFixed(1)}%`,
            });
        }
        return ticks;
    });
</script>

<div class="demo-box graph-container">
    <h4 class="graph-title">
        <i class="fa-solid fa-chart-line"></i> Creator Distribution Curve
    </h4>
    <div class="graph-wrapper">
        <svg
            role="img"
            aria-label="Creator Distribution Curve"
            viewBox="0 0 {points.w} {points.h}"
            width="100%"
            height="100%"
            onmousemove={handleMouseMove}
            onmouseleave={handleMouseLeave}
        >
            <defs>
                <linearGradient
                    id="area-grad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                >
                    <stop
                        offset="0%"
                        stop-color="#7bc3b0"
                        stop-opacity="0.35"
                    />
                    <stop
                        offset="100%"
                        stop-color="#7bc3b0"
                        stop-opacity="0.05"
                    />
                </linearGradient>
                <linearGradient
                    id="line-grad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                >
                    <stop offset="0%" stop-color="#b5e3d4" />
                    <stop offset="100%" stop-color="#7bc3b0" />
                </linearGradient>
            </defs>

            <!-- Grid lines -->
            {#each xTicks as tick}
                <line
                    x1={tick.x}
                    y1={points.margin.top}
                    x2={tick.x}
                    y2={points.h - points.margin.bottom}
                    stroke="rgba(123, 195, 176, 0.08)"
                    stroke-dasharray="3,3"
                />
            {/each}
            {#each yTicks as tick}
                <line
                    x1={points.margin.left}
                    y1={tick.y}
                    x2={points.w - points.margin.right}
                    y2={tick.y}
                    stroke="rgba(123, 195, 176, 0.08)"
                    stroke-dasharray="3,3"
                />
            {/each}

            <!-- Area under the curve -->
            {#if points.areaPath}
                <path d={points.areaPath} fill="url(#area-grad)" />
            {/if}

            <!-- Axes -->
            <!-- X-Axis -->
            <line
                x1={points.margin.left}
                y1={points.h - points.margin.bottom}
                x2={points.w - points.margin.right}
                y2={points.h - points.margin.bottom}
                stroke="#1f5a4b"
                stroke-width="1.5"
            />
            <!-- Y-Axis -->
            <line
                x1={points.margin.left}
                y1={points.margin.top}
                x2={points.margin.left}
                y2={points.h - points.margin.bottom}
                stroke="#1f5a4b"
                stroke-width="1.5"
            />

            <!-- X Axis ticks & labels -->
            {#each xTicks as tick}
                <line
                    x1={tick.x}
                    y1={points.h - points.margin.bottom}
                    x2={tick.x}
                    y2={points.h - points.margin.bottom + 5}
                    stroke="#1f5a4b"
                />
                <text
                    x={tick.x}
                    y={points.h - points.margin.bottom + 20}
                    text-anchor="middle"
                    fill="#8fc0b2"
                    font-size="10"
                    font-family="system-ui, sans-serif"
                >
                    {tick.label}
                </text>
            {/each}

            <!-- Y Axis ticks & labels -->
            {#each yTicks as tick}
                <line
                    x1={points.margin.left - 5}
                    y1={tick.y}
                    x2={points.margin.left}
                    stroke="#1f5a4b"
                />
                <text
                    x={points.margin.left - 10}
                    y={tick.y + 4}
                    text-anchor="end"
                    fill="#8fc0b2"
                    font-size="10"
                    font-family="system-ui, sans-serif"
                >
                    {tick.label}
                </text>
            {/each}

            <!-- Line path -->
            {#if points.path}
                <path
                    d={points.path}
                    fill="none"
                    stroke="url(#line-grad)"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            {/if}

            <!-- Active point indicators -->
            {#if hoverIndex !== null && points.dots[hoverIndex]}
                {@const activeDot = points.dots[hoverIndex]}
                <!-- Vertical indicator line -->
                <line
                    x1={activeDot.x}
                    y1={points.margin.top}
                    x2={activeDot.x}
                    y2={points.h - points.margin.bottom}
                    stroke="#7bc3b0"
                    stroke-dasharray="2,2"
                    opacity="0.4"
                />
                <!-- Horizontal indicator line -->
                <line
                    x1={points.margin.left}
                    y1={activeDot.y}
                    x2={activeDot.x}
                    y2={activeDot.y}
                    stroke="#7bc3b0"
                    stroke-dasharray="2,2"
                    opacity="0.4"
                />
                <!-- Highlight circle -->
                <circle
                    cx={activeDot.x}
                    cy={activeDot.y}
                    r="5"
                    fill="#b5e3d4"
                    stroke="#001a16"
                    stroke-width="2"
                />
                <!-- Glow effect -->
                <circle
                    cx={activeDot.x}
                    cy={activeDot.y}
                    r="10"
                    fill="#b5e3d4"
                    opacity="0.2"
                />
            {/if}
        </svg>

        <!-- HTML Tooltip Overlay -->
        {#if hoverIndex !== null && points.dots[hoverIndex]}
            {@const activeDot = points.dots[hoverIndex]}
            <div
                class="graph-tooltip"
                style="left: {(activeDot.x / points.w) *
                    100}%; top: {(activeDot.y / points.h) *
                    100}%; transform: translate({activeDot.x > points.w / 2
                    ? '-110%'
                    : '10%'}, -110%)"
            >
                <div class="tooltip-title">Rank {activeDot.rank}</div>
                <div class="tooltip-value">
                    {activeDot.percentage.toFixed(2)}%
                </div>
            </div>
        {/if}
    </div>

    <div class="graph-footer">
        <span>X-Axis: Percentage share of rewards</span>
        <span>Y-Axis: Participant Rank</span>
    </div>
</div>

<style>
    .graph-container {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        background: rgba(0, 20, 18, 0.4);
        border: 1px solid rgba(31, 90, 75, 0.6);
        border-radius: 16px;
        padding: 1.25rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        margin: 1.5rem 0;
    }

    .graph-title {
        margin: 0;
        font-size: 1.1rem;
        color: #d4e9e9;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .graph-title :global(i) {
        color: #7bc3b0;
    }

    .graph-wrapper {
        position: relative;
        width: 100%;
        background: rgba(0, 10, 8, 0.2);
        border-radius: 12px;
        padding: 0.5rem;
        border: 1px solid rgba(31, 90, 75, 0.2);
    }

    svg {
        display: block;
        overflow: visible;
        cursor: crosshair;
    }

    .graph-tooltip {
        position: absolute;
        pointer-events: none;
        background: rgba(0, 28, 24, 0.95);
        border: 1px solid #7bc3b0;
        border-radius: 8px;
        padding: 0.4rem 0.6rem;
        font-family: system-ui, sans-serif;
        color: #d4f0e6;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(4px);
        z-index: 10;
        transition:
            left 0.1s ease-out,
            top 0.1s ease-out;
    }

    .tooltip-title {
        font-size: 0.75rem;
        color: #8fc0b2;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .tooltip-value {
        font-size: 0.95rem;
        font-weight: bold;
        color: #b5e3d4;
    }

    .graph-footer {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: #8fc0b2;
        padding: 0 0.25rem;
    }
</style>
