<script lang="ts">
  import { curveOrientation } from ".";

  const radius = 100;

  const sizeA = radius * 2,
    sizeB = radius * Math.PI;

  const strokeWidth = 30;

  const { viewBox, d } = $derived.by(() => {
    let viewBox: string;
    if ($curveOrientation === "v") {
      const width = sizeA,
        height = sizeB;
      viewBox = `-${strokeWidth / 2} -${strokeWidth / 2} ${width + strokeWidth} ${height + strokeWidth}`;
    } else {
      const width = sizeB,
        height = sizeA;
      viewBox = `-${strokeWidth / 2} -${strokeWidth / 2} ${width + strokeWidth} ${height + strokeWidth}`;
    }

    let pathData = "M";
    for (let t = 0; t <= Math.PI; t += 0.1) {
      const a = radius * (1 - Math.cos(t)),
        b = radius * (t - Math.sin(t));
      const { x, y } =
        $curveOrientation === "v" ? { x: a, y: b } : { x: b, y: a };
      pathData += `${x},${y} `;
    }

    return { viewBox, d: pathData.trim() };
  });
</script>

<svg class="icon" {viewBox}>
  <path
    {d}
    stroke="currentColor"
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
  />
</svg>
