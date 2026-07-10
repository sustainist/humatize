<script lang="ts">
  import { drawCurve } from ".";
  // import { theme } from "../theme";

  let {
    profit = 0,
    participants,
    position,
    limitDecimals = false,
    roundShare = false,
    orientation = "v",
    onPositionChange,
  }: {
    participants: number;
    position: number;
    limitDecimals?: boolean;
    orientation?: "v" | "h";
    profit: number;
    roundShare?: boolean;
    onPositionChange?: (position: number) => void;
  } = $props();

  const handleOnpointerdown = (
    e: PointerEvent & {
      currentTarget: EventTarget & HTMLCanvasElement;
    },
  ) => {
    const handleOnpointermove = (e: PointerEvent) => {
      if (orientation === "v") {
        const { height, top } = elBoundaries;
        const top1 = top + padTop;
        const height1 = height - padBottom - padTop;
        const pY = e.pageY - document.documentElement.scrollTop;
        if (pY > top1 && pY < top + height - padBottom) {
          position = Math.trunc((pY - top1) / (height1 / participants)) + 1;
          onPositionChange?.(position);
        }
      } else {
        const { width, left } = elBoundaries;
        const left1 = left + padLeft;
        const width1 = width - padRight - padLeft;
        const pX = e.pageX - document.documentElement.scrollLeft;
        if (pX > left1 && pX < left + width - padRight) {
          position = Math.trunc((pX - left1) / (width1 / participants)) + 1;
          onPositionChange?.(position);
        }
      }
    };

    const handleOnpointerup = () => {
      canvas.removeEventListener("pointermove", handleOnpointermove);
      document.removeEventListener("pointerup", handleOnpointerup);
    };

    const canvas = e.currentTarget;
    const elBoundaries = canvas.getBoundingClientRect();

    handleOnpointermove(e);

    canvas.addEventListener("pointermove", handleOnpointermove);
    document.addEventListener("pointerup", handleOnpointerup);
  };

  const draw = () => {
    if (position > participants) {
      position = participants || 1;
      onPositionChange?.(position);
    } else if (position < 1) {
      position = 1;
      onPositionChange?.(position);
    }
    drawCurve({
      participants,
      position,
      profit,
      roundShare,
      orientation,
      limitDecimals,
      radius,
      padLeft,
      padTop,
      padRight,
      padBottom,
      canvas,
    });
  };

  $effect(() => {
    // $theme;
    draw();
  });

  let canvas: HTMLCanvasElement;
  const radius = 128;

  const padding = radius / 5;
  const padLeft = padding,
    padTop = padding,
    padRight = 2,
    padBottom = 2;
</script>

<canvas onpointerdown={handleOnpointerdown} bind:this={canvas}></canvas>

<style>
  canvas {
    background-color: var(--bg-color);
    max-width: 100%;
    display: block;
  }
</style>
