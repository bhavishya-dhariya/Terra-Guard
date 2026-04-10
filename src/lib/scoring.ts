import type { ThreatLevel } from "../types/game";

export type Grade = "S" | "A" | "B" | "C" | "D";

export function calculateRoundXp({
  livesSavedDelta,
  livesLostDelta,
  decisionTimeSeconds,
  timeout,
  perfectRound,
}: {
  livesSavedDelta: number;
  livesLostDelta: number;
  decisionTimeSeconds: number;
  timeout: boolean;
  perfectRound: boolean;
}) {
  let xp = 0;
  xp += livesSavedDelta * 100;
  xp += livesLostDelta * -50;
  if (!timeout && decisionTimeSeconds < 10) xp += 200;
  if (timeout) xp -= 500;
  if (perfectRound) xp += 300;
  return xp;
}

export function calculateEndGameBonus({
  maxThreatReached,
}: {
  maxThreatReached: ThreatLevel;
}) {
  return maxThreatReached <= 7 ? 500 : 0;
}

export function survivalRate(livesSaved: number, livesLost: number) {
  const total = livesSaved + livesLost;
  if (total <= 0) return 0;
  return livesSaved / total;
}

export function gradeFromSurvivalRate(rate: number): Grade {
  if (rate >= 0.85) return "S";
  if (rate >= 0.7) return "A";
  if (rate >= 0.55) return "B";
  if (rate >= 0.4) return "C";
  return "D";
}

