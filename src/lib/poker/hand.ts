import {
  bestFlush,
  bestStraightFlush,
  byDesc,
  categoryScore,
  findStraight,
  gatherGroups,
  rankToValue,
  uniqued,
  valueToRank,
  valuesToRanks,
  type Card,
  type Category,
} from "./domain";

export type EvaluatedHand = {
  category: Category;
  primaryRanks: string[];
  kickers?: string[];
  rankVector: number[];
};

export function evaluateHand(cards: Card[]): EvaluatedHand {
  if (cards.length !== 7) throw new Error("Texas Hold'em evaluation expects 7 cards");

  const allValues = cards.map((c) => rankToValue[c.rank]);
  const uniqueValuesDesc = uniqued(allValues).sort(byDesc);
  const { quads, trips, pairs } = gatherGroups(allValues);

  // Straight Flush
  const straightFlush = bestStraightFlush(cards);
  if (straightFlush) {
    const ranks = valuesToRanks(straightFlush);
    return {
      category: "straightFlush",
      primaryRanks: ranks,
      rankVector: [categoryScore.straightFlush, straightFlush[0], ...straightFlush.slice(1)],
    };
  }

  // Four of a kind
  if (quads.length) {
    const quad = quads[0];
    const kicker = uniqueValuesDesc.find((v) => v !== quad)!;
    return {
      category: "fourKind",
      primaryRanks: [valueToRank[quad]],
      kickers: [valueToRank[kicker]],
      rankVector: [categoryScore.fourKind, quad, kicker],
    };
  }

  // Full House
  if (trips.length) {
    const trip = trips[0];
    const remainingTrips = trips.slice(1);
    const availablePairs = [...remainingTrips, ...pairs];
    if (availablePairs.length) {
      const pair = availablePairs[0];
      return {
        category: "fullHouse",
        primaryRanks: [valueToRank[trip], valueToRank[pair]],
        rankVector: [categoryScore.fullHouse, trip, pair],
      };
    }
  }

  // Flush
  const flush = bestFlush(cards);
  if (flush) {
    return {
      category: "flush",
      primaryRanks: valuesToRanks(flush),
      rankVector: [categoryScore.flush, ...flush],
    };
  }

  // Straight
  const straight = findStraight(uniqueValuesDesc);
  if (straight) {
    return {
      category: "straight",
      primaryRanks: valuesToRanks(straight),
      rankVector: [categoryScore.straight, straight[0]],
    };
  }

  // Three of a kind
  if (trips.length) {
    const trip = trips[0];
    const kickers = uniqueValuesDesc.filter((v) => v !== trip).slice(0, 2);
    return {
      category: "threeKind",
      primaryRanks: [valueToRank[trip]],
      kickers: valuesToRanks(kickers),
      rankVector: [categoryScore.threeKind, trip, ...kickers],
    };
  }

  // Two Pair
  if (pairs.length >= 2) {
    const [highPair, lowPair] = pairs.slice(0, 2);
    const kicker = uniqueValuesDesc.find((v) => v !== highPair && v !== lowPair)!;
    return {
      category: "twoPair",
      primaryRanks: [valueToRank[highPair], valueToRank[lowPair]],
      kickers: [valueToRank[kicker]],
      rankVector: [categoryScore.twoPair, highPair, lowPair, kicker],
    };
  }

  // One Pair
  if (pairs.length === 1) {
    const pair = pairs[0];
    const kickers = uniqueValuesDesc.filter((v) => v !== pair).slice(0, 3);
    return {
      category: "onePair",
      primaryRanks: [valueToRank[pair]],
      kickers: valuesToRanks(kickers),
      rankVector: [categoryScore.onePair, pair, ...kickers],
    };
  }

  // High Card
  const highs = uniqueValuesDesc.slice(0, 5);
  return {
    category: "highCard",
    primaryRanks: valuesToRanks(highs),
    rankVector: [categoryScore.highCard, ...highs],
  };
}

export function compareHands(a: EvaluatedHand, b: EvaluatedHand): number {
  const maxLen = Math.max(a.rankVector.length, b.rankVector.length);
  for (let i = 0; i < maxLen; i += 1) {
    const av = a.rankVector[i] ?? 0;
    const bv = b.rankVector[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}
