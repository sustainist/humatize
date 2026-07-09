<script lang="ts">
  import { curveOrientation } from ".";

  const radius = 100;

  const sizeA = radius * 2,
    sizeB = radius * Math.PI;

  const strokeWidth = 30;
  const lines = 3;

  const { viewBox, x1, y1, x2, y2 } = $derived.by(() => {
    let width: number, height: number;
    let viewBox: string;

    let x1: (i: number) => number,
      y1: (i: number) => number,
      x2: (i: number) => number,
      y2: (i: number) => number;

    if ($curveOrientation === "v") {
      width = sizeA;
      height = sizeB;

      viewBox = `-${strokeWidth / 2} -${strokeWidth / 2} ${width + strokeWidth} ${height + strokeWidth}`;

      x1 = () => 0;
      x2 = () => width;
      y1 = (i) => (height / lines) * i;
      y2 = (i) => (height / lines) * i;
    } else {
      width = sizeB;
      height = sizeA;

      viewBox = `-${strokeWidth / 2} -${strokeWidth / 2} ${width + strokeWidth} ${height + strokeWidth}`;

      x1 = (i) => (width / lines) * i;
      x2 = (i) => (width / lines) * i;
      y1 = () => 0;
      y2 = () => height;
    }
    return { viewBox, x1, y1, x2, y2, width, height };
  });
</script>

<svg class="icon" {viewBox}>
  {#each { length: lines - 1 } as _, i}
    <line
      x1={x1(i + 1)}
      y1={y1(i + 1)}
      x2={x2(i + 1)}
      y2={y2(i + 1)}
      stroke="currentColor"
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  {/each}
</svg>
