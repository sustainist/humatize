<script lang="ts">
  import { curveOrientation } from ".";

  const radius = 100;

  const sizeA = radius * 2,
    sizeB = radius * Math.PI;

  const strokeWidth = 30;

  const { viewBox } = $derived.by(() => {
    let viewBox: string;
    let w: number;
    let h: number;

    if ($curveOrientation === "v") {
      w = sizeA;
      h = sizeB;

      viewBox = `-${strokeWidth / 2} -${strokeWidth / 2} ${w + strokeWidth} ${h + strokeWidth}`;
    } else {
      w = sizeB;
      h = sizeA;

      viewBox = `-${strokeWidth / 2} -${strokeWidth / 2} ${w + strokeWidth} ${h + strokeWidth}`;
    }
    return { viewBox };
  });
</script>

<svg class="icon" {viewBox}>
  <circle
    r={strokeWidth * 1.5}
    stroke-width={strokeWidth}
    cx="50%"
    cy="50%"
    fill="none"
    stroke="currentColor"
  />
</svg>
