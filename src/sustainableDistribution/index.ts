import { writable } from "svelte/store";

export const drawCurve = ({
  participants,
  position,
  profit,
  radius,
  roundShare,
  padBottom,
  padLeft,
  padRight,
  padTop,
  limitDecimals,
  orientation,
  canvas,
}: {
  participants: number;
  position: number;
  profit: number;
  roundShare: boolean;
  orientation: "h" | "v";
  limitDecimals: boolean;
  radius: number;
  padLeft: number;
  padTop: number;
  padRight: number;
  padBottom: number;
  canvas: HTMLCanvasElement;
}) => {
  if (!canvas) return;

  const sizeA = radius * Math.PI,
    sizeB = radius * 2;

  const { canvasW, canvasH } =
    orientation === "v"
      ? {
        canvasW: padLeft + sizeB + padRight,
        canvasH: padTop + sizeA + padBottom,
      }
      : {
        canvasW: padLeft + sizeA + padRight,
        canvasH: padTop + sizeB + padBottom,
      };
  canvas.width = canvasW;
  canvas.height = canvasH;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.lineWidth = 1.5;

  const drawCurve = () => {
    ctx.beginPath();
    for (let t = 0; t <= Math.PI; t += 0.01) {
      const a = radius * (t - Math.sin(t)),
        b = radius * (1 - Math.cos(t));
      const { x, y } = orientation === "v" ? { x: b, y: a } : { x: a, y: b };
      ctx.lineTo(padLeft + x, padTop + y);
    }
    ctx.stroke();
  };

  const drawIntersections = () => {
    const values = getShare({
      participants: participants,
      position: position,
      radius,
      roundShare,
      profit,
    });

    const { a1, b1, a2, b2, percentage: tautochronePercentage, share: tautochroneShare } = values;

    const { x1, y1, x2, y2, sizeX, sizeY } =
      orientation === "v"
        ? { x1: b1, y1: a1, x2: b2, y2: a2, sizeX: sizeB, sizeY: sizeA }
        : { x1: a1, y1: b1, x2: a2, y2: b2, sizeX: sizeA, sizeY: sizeB };

    const plX1 = Math.round(padLeft + x1),
      ptY1 = Math.round(padTop + y1);

    const plx2 = Math.round(padLeft + x2),
      ptY2 = Math.round(padTop + y2);

    const pl = Math.round(padLeft),
      pt = Math.round(padTop);

    const plSx = Math.round(padLeft + sizeX),
      ptSy = Math.round(padTop + sizeY);

    ctx.beginPath();

    ctx.moveTo(plX1, pt);
    ctx.lineTo(plX1, ptY1);
    ctx.lineTo(pl, ptY1);

    ctx.moveTo(plx2, pt);
    ctx.lineTo(plx2, ptY1);
    ctx.lineTo(plSx, ptY1);

    ctx.moveTo(plX1, ptSy);
    ctx.lineTo(plX1, ptY2);
    ctx.lineTo(pl, ptY2);

    ctx.moveTo(plx2, ptSy);
    ctx.lineTo(plx2, ptY2);
    ctx.lineTo(plSx, ptY2);

    ctx.moveTo(plX1, ptY1);
    ctx.lineTo(plX1, ptY2);
    ctx.lineTo(plx2, ptY2);
    ctx.lineTo(plx2, ptY1);
    ctx.lineTo(plX1, ptY1);

    const { evenPercentDecimals, tautPercentDecimals } = limitDecimals
      ? {
        evenPercentDecimals: parseFloat((100 / participants).toFixed(2)),
        tautPercentDecimals: parseFloat(
          (tautochronePercentage * 100).toFixed(2),
        ),
      }
      : {
        evenPercentDecimals: 100 / participants,
        tautPercentDecimals: tautochronePercentage * 100,
      };

    const { textA, textB, textC, textD } =
      orientation === "v"
        ? {
          textA: `Percentage: ${tautPercentDecimals}%`,
          textC: ``,
          textB: `Participants: ${participants}, Position: ${position}`,
          textD: ``,
        }
        : {
          textD: ``,
          textB: `Percentage: ${tautPercentDecimals}%`,
          textC: ``,
          textA: `Participants: ${participants}, Position: ${position}`,
        };

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const fontSize = 0.62;
    const fontFamily = "Arial";

    ctx.font = `${padTop * fontSize}px ${fontFamily}`;
    ctx.fillText(textA, padLeft + sizeX / 2, padTop / 2);

    ctx.font = `${padLeft * fontSize}px ${fontFamily}`;
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(textB, -(padTop + sizeY / 2), padLeft / 2);
    ctx.restore();

    ctx.font = `${padBottom * fontSize}px ${fontFamily}`;
    ctx.fillText(textD, padLeft + sizeX / 2, padTop + sizeY + padBottom / 2);

    ctx.font = `${padRight * fontSize}px ${fontFamily}`;
    ctx.save();
    ctx.rotate(Math.PI / 2);
    ctx.fillText(textC, sizeY / 2 + padTop, -(padLeft + sizeX + padRight / 2));
    ctx.restore();

    ctx.stroke();
  };

  ctx.clearRect(0, 0, canvasW, canvasH);
  // ctx.strokeStyle = ctx.fillStyle = getComputedStyle(document.documentElement)
  //   .getPropertyValue("--color")
  //   .trim();  

  const firstP = document.querySelector("p")
  if (firstP) {
    ctx.strokeStyle = ctx.fillStyle = getComputedStyle(firstP).color
  }
  drawCurve();
  if (participants > 0) drawIntersections();
};

export const getShare = ({
  profit = 0,
  participants = 0,
  position = 0,
  radius = 128,
  roundShare = false,
}: {
  profit: number;
  participants: number;
  position: number;
  radius?: number;
  roundShare?: boolean;
}): {
  percentage: number;
  share: number;
  a1: number;
  b1: number;
  a2: number;
  b2: number;
} => {
  const sizeA = radius * Math.PI,
    sizeB = radius * 2;

  const getIntersection = (n: number) => {
    let t = Math.PI / 2,
      converged = false;
    for (let i = 0; i < 20; i++) {
      const tNext = t - (t - Math.sin(t) - n / radius) / (1 - Math.cos(t)),
        delta = Math.abs(tNext - t);
      t = tNext;
      if (delta < 1e-8) {
        converged = true;
        break;
      }
    }
    const y = converged ? radius * (1 - Math.cos(t)) : 0;
    return y;
  };

  if (position < 1 || position > participants)
    return {
      percentage: 0,
      share: 0,
      a1: 0,
      b1: 0,
      a2: 0,
      b2: 0,
    };

  const splits = sizeA / participants;

  const a1 = splits * (position - 1),
    b1 = getIntersection(a1);
  const a2 = splits * position,
    b2 = getIntersection(a2);

  const tautochronePercentage = (b2 - b1) / sizeB;

  const percentageProfit = tautochronePercentage * profit;

  const roundedShare = roundShare
    ? Math.round(percentageProfit)
    : percentageProfit;

  return { percentage: tautochronePercentage, a1, b1, a2, b2, share: roundedShare };
};

export const curveOrientation = writable<"v" | "h">(
  localStorage.getItem("curve orientation") === "h" ? "h" : "v",
);
curveOrientation.subscribe((value) =>
  localStorage.setItem("curve orientation", value),
);

export type Distribution = {
  position?: number;
  participantName?: 'Creator' | 'Backer'
  hideParticipants?: boolean
  sustainableModel?: 'creators' | 'backers'
  goal: number
  roundNumbers?: boolean
  hidePeople?: boolean
  participants: ({
    id?: number;
    text?: string;
    parent?: number;
    showCheckmark?: boolean;
    pledge?: number;
    share?: string;
    timestamp?: string | number
    percentageBacker?: number
    rewardBacker?: number
    nrOfPeople?: number
    email?: string | null
    distributionStart?: number
    distributionEnd?: number
  } | null)[];
  editOrder?: boolean;
  showCompensation?: boolean;
  showPledge?: boolean;
  showTimeline?: boolean
} & (
    | { showOrder?: boolean; showSize?: never }
    | { showOrder?: never; showSize?: boolean }
    | { showOrder?: boolean; showSize?: boolean }
  );

export const getReferencePoint = ({ share, position, participants }: { share: number, position: number, participants: number }): number => {
  if (!Number.isFinite(share) || share <= 0 || participants <= 0 || position < 1 || position > participants) {
    return 0;
  }

  const baseline = getShare({
    profit: 1,
    position,
    participants,
    roundShare: false,
  });

  if (baseline.percentage <= 0) {
    return 0;
  }

  return share / baseline.percentage;
}

export const addShares = ({
  profit,
  participants,
  startPosition,
  endPosition,
}: {
  profit: number;
  participants: number;
  startPosition: number;
  endPosition: number;
}): number => {
  if (!Number.isFinite(profit) || !Number.isFinite(participants) || participants <= 0) {
    return 0;
  }

  const start = Math.min(startPosition, endPosition);
  const end = Math.max(startPosition, endPosition);

  let total = 0;

  for (let position = start; position <= end; position++) {
    const result = getShare({
      profit,
      participants,
      position,
      roundShare: false,
    });

    total += result.share;
  }

  return total;
}
