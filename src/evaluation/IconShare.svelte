<script lang="ts">
  import { curveOrientation } from ".";

  const radius = 100;

  const sizeA = radius * 2,
    sizeB = radius * Math.PI;

  const strokeWidth = 30;

  const { viewBox, points } = $derived.by(() => {
    let viewBox: string;
    let points: string;
    let w: number;
    let h: number;

    if ($curveOrientation === "v") {
      w = sizeA;
      h = sizeB;

      viewBox = `-${strokeWidth / 2} -${strokeWidth / 2} ${w + strokeWidth} ${h + strokeWidth}`;

      points = `${w / 2},${h / 4} ${w},${h - h / 4} 0,${h - h / 4}`;
    } else {
      w = sizeB;
      h = sizeA;

      viewBox = `-${strokeWidth / 2} -${strokeWidth / 2} ${w + strokeWidth} ${h + strokeWidth}`;

      points = `${w / 4},${h / 2} ${w - w / 4},0 ${w - w / 4},${h}`;
    }
    return { viewBox, points };
  });
</script>

<svg class="icon" {viewBox}>
  <polygon
    {points}
    fill="none"
    stroke="currentColor"
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
