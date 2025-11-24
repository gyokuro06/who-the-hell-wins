type Suit = "spades" | "hearts" | "diamonds" | "clubs";

export type Card = { rank: string; suit: Suit };

export type Category =
  | "straightFlush"
  | "fourKind"
  | "fullHouse"
  | "flush"
  | "straight"
  | "threeKind"
  | "twoPair"
  | "onePair"
  | "highCard";

export type GroupInfo = {
  quads: number[];
  trips: number[];
  pairs: number[];
  counts: Map<number, number>;
};

export const rankOrder = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"] as const;
export const rankToValue: Record<string, number> = Object.fromEntries(
  rankOrder.map((r, i) => [r, i + 2])
) as Record<string, number>;
export const valueToRank: Record<number, string> = Object.fromEntries(
  rankOrder.map((r, i) => [i + 2, r])
) as Record<number, string>;

export const categoryScore: Record<Category, number> = {
  highCard: 0,
  onePair: 1,
  twoPair: 2,
  threeKind: 3,
  straight: 4,
  flush: 5,
  fullHouse: 6,
  fourKind: 7,
  straightFlush: 8,
};

export const byDesc = (a: number, b: number) => b - a;

export function uniqued(values: number[]): number[] {
  return [...new Set(values)];
}

export function valuesToRanks(values: number[]): string[] {
  return values.map((v) => valueToRank[v] ?? "A");
}

// Detects the highest straight; returns array of values length 5 (may include 1 for wheel)
export function findStraight(valuesDescUnique: number[]): number[] | null {
  const vals = [...valuesDescUnique];
  if (vals.includes(14)) vals.push(1); // wheel support
  for (let i = 0; i <= vals.length - 5; i += 1) {
    const seq = vals.slice(i, i + 5);
    const max = seq[0];
    let ok = true;
    for (let j = 1; j < 5; j += 1) {
      if (seq[j] !== max - j) {
        ok = false;
        break;
      }
    }
    if (ok) return seq.slice(0, 5);
  }
  return null;
}

export function gatherGroups(values: number[]): GroupInfo {
  const counts = new Map<number, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  const quads: number[] = [];
  const trips: number[] = [];
  const pairs: number[] = [];
  counts.forEach((cnt, v) => {
    if (cnt === 4) quads.push(v);
    else if (cnt === 3) trips.push(v);
    else if (cnt === 2) pairs.push(v);
  });
  quads.sort(byDesc);
  trips.sort(byDesc);
  pairs.sort(byDesc);
  return { quads, trips, pairs, counts };
}

export function bestStraightFlush(cards: Card[]): number[] | null {
  const suits: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
  for (const suit of suits) {
    const suited = cards.filter((c) => c.suit === suit);
    if (suited.length < 5) continue;
    const values = uniqued(suited.map((c) => rankToValue[c.rank])).sort(byDesc);
    const straight = findStraight(values);
    if (straight) return straight;
  }
  return null;
}

export function bestFlush(cards: Card[]): number[] | null {
  const suits: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
  let best: number[] | null = null;
  for (const suit of suits) {
    const suited = cards.filter((c) => c.suit === suit);
    if (suited.length < 5) continue;
    const values = suited.map((c) => rankToValue[c.rank]).sort(byDesc);
    const top5 = values.slice(0, 5);
    if (!best) best = top5;
    else {
      for (let i = 0; i < 5; i += 1) {
        if (top5[i] !== best[i]) {
          if (top5[i] > best[i]) best = top5;
          break;
        }
      }
    }
  }
  return best;
}
