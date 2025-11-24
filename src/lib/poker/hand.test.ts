import { describe, expect, test } from "vitest";
import { evaluateHand, compareHands } from "./hand";

const H = "hearts";
const D = "diamonds";
const C = "clubs";
const S = "spades";

describe("hand evaluation (Texas Hold'em 7 -> best 5)", () => {
  test("detects straight flush vs weaker hands", () => {
    const cards = [
      { rank: "A", suit: H },
      { rank: "K", suit: H },
      { rank: "Q", suit: H },
      { rank: "J", suit: H },
      { rank: "10", suit: H },
      { rank: "2", suit: C },
      { rank: "3", suit: D },
    ];

    const result = evaluateHand(cards);
    expect(result.category).toBe("straightFlush");
    expect(result.primaryRanks).toEqual(["A", "K", "Q", "J", "10"]);
  });

  test("wheel straight (A-2-3-4-5) is the weakest straight", () => {
    const cards = [
      { rank: "A", suit: S },
      { rank: "2", suit: H },
      { rank: "3", suit: D },
      { rank: "4", suit: C },
      { rank: "5", suit: H },
      { rank: "K", suit: D },
      { rank: "9", suit: S },
    ];

    const result = evaluateHand(cards);
    expect(result.category).toBe("straight");
    expect(result.primaryRanks).toEqual(["5", "4", "3", "2", "A"]);
  });

  test("four of a kind beats full house", () => {
    const fourKind = evaluateHand([
      { rank: "9", suit: H },
      { rank: "9", suit: D },
      { rank: "9", suit: C },
      { rank: "9", suit: S },
      { rank: "K", suit: H },
      { rank: "3", suit: D },
      { rank: "2", suit: C },
    ]);

    const fullHouse = evaluateHand([
      { rank: "Q", suit: H },
      { rank: "Q", suit: D },
      { rank: "Q", suit: C },
      { rank: "J", suit: S },
      { rank: "J", suit: H },
      { rank: "4", suit: D },
      { rank: "2", suit: C },
    ]);

    expect(compareHands(fourKind, fullHouse)).toBeGreaterThan(0);
  });

  test("flush tie breaks by kickers", () => {
    const highFlush = evaluateHand([
      { rank: "A", suit: C },
      { rank: "K", suit: C },
      { rank: "8", suit: C },
      { rank: "6", suit: C },
      { rank: "2", suit: C },
      { rank: "9", suit: H },
      { rank: "4", suit: D },
    ]);

    const lowerFlush = evaluateHand([
      { rank: "K", suit: C },
      { rank: "J", suit: C },
      { rank: "9", suit: C },
      { rank: "6", suit: C },
      { rank: "2", suit: C },
      { rank: "A", suit: D },
      { rank: "3", suit: S },
    ]);

    expect(compareHands(highFlush, lowerFlush)).toBeGreaterThan(0);
  });

  test("two pair compares top pair, then second pair, then kicker", () => {
    const better = evaluateHand([
      { rank: "K", suit: H },
      { rank: "K", suit: D },
      { rank: "9", suit: S },
      { rank: "9", suit: C },
      { rank: "A", suit: H },
      { rank: "4", suit: D },
      { rank: "2", suit: C },
    ]);

    const worse = evaluateHand([
      { rank: "Q", suit: H },
      { rank: "Q", suit: D },
      { rank: "J", suit: S },
      { rank: "J", suit: C },
      { rank: "A", suit: C },
      { rank: "5", suit: D },
      { rank: "3", suit: H },
    ]);

    expect(compareHands(better, worse)).toBeGreaterThan(0);
  });

  test("exactly tied hands return 0", () => {
    const a = evaluateHand([
      { rank: "A", suit: H },
      { rank: "A", suit: D },
      { rank: "K", suit: S },
      { rank: "Q", suit: C },
      { rank: "9", suit: H },
      { rank: "7", suit: D },
      { rank: "3", suit: C },
    ]);

    const b = evaluateHand([
      { rank: "A", suit: C },
      { rank: "A", suit: S },
      { rank: "K", suit: H },
      { rank: "Q", suit: D },
      { rank: "9", suit: S },
      { rank: "7", suit: C },
      { rank: "3", suit: D },
    ]);

    expect(compareHands(a, b)).toBe(0);
  });

  test("full house compares three-of-a-kind rank first, then pair rank", () => {
    const stronger = evaluateHand([
      { rank: "K", suit: H },
      { rank: "K", suit: D },
      { rank: "K", suit: C },
      { rank: "9", suit: S },
      { rank: "9", suit: H },
      { rank: "4", suit: D },
      { rank: "2", suit: C },
    ]);

    const weaker = evaluateHand([
      { rank: "Q", suit: H },
      { rank: "Q", suit: D },
      { rank: "Q", suit: C },
      { rank: "A", suit: S },
      { rank: "A", suit: H },
      { rank: "5", suit: D },
      { rank: "3", suit: C },
    ]);

    expect(compareHands(stronger, weaker)).toBeGreaterThan(0);
  });

  test("three of a kind beats two pair", () => {
    const trips = evaluateHand([
      { rank: "J", suit: H },
      { rank: "J", suit: D },
      { rank: "J", suit: C },
      { rank: "A", suit: S },
      { rank: "9", suit: H },
      { rank: "7", suit: D },
      { rank: "4", suit: C },
    ]);

    const twoPair = evaluateHand([
      { rank: "K", suit: H },
      { rank: "K", suit: D },
      { rank: "9", suit: S },
      { rank: "9", suit: C },
      { rank: "5", suit: H },
      { rank: "4", suit: D },
      { rank: "2", suit: C },
    ]);

    expect(compareHands(trips, twoPair)).toBeGreaterThan(0);
  });

  test("one pair compares kickers in order", () => {
    const better = evaluateHand([
      { rank: "A", suit: H },
      { rank: "A", suit: D },
      { rank: "K", suit: S },
      { rank: "J", suit: C },
      { rank: "9", suit: H },
      { rank: "4", suit: D },
      { rank: "2", suit: C },
    ]);

    const worse = evaluateHand([
      { rank: "A", suit: C },
      { rank: "A", suit: S },
      { rank: "Q", suit: H },
      { rank: "J", suit: D },
      { rank: "8", suit: S },
      { rank: "5", suit: C },
      { rank: "3", suit: H },
    ]);

    expect(compareHands(better, worse)).toBeGreaterThan(0);
  });

  test("high card comparison walks through all five cards", () => {
    const higher = evaluateHand([
      { rank: "A", suit: H },
      { rank: "Q", suit: D },
      { rank: "9", suit: S },
      { rank: "6", suit: C },
      { rank: "4", suit: H },
      { rank: "3", suit: D },
      { rank: "2", suit: C },
    ]);

    const lower = evaluateHand([
      { rank: "A", suit: S },
      { rank: "J", suit: H },
      { rank: "9", suit: C },
      { rank: "6", suit: D },
      { rank: "4", suit: C },
      { rank: "3", suit: H },
      { rank: "2", suit: D },
    ]);

    expect(compareHands(higher, lower)).toBeGreaterThan(0);
  });

  test("best two pairs are chosen when three distinct pairs exist", () => {
    const result = evaluateHand([
      { rank: "K", suit: H },
      { rank: "K", suit: D },
      { rank: "Q", suit: S },
      { rank: "Q", suit: C },
      { rank: "J", suit: H },
      { rank: "J", suit: D },
      { rank: "9", suit: C },
    ]);

    expect(result.category).toBe("twoPair");
    expect(result.primaryRanks.slice(0, 2)).toEqual(["K", "Q"]);
    expect(result.kickers?.[0]).toBe("J");
  });

  test("flush picks the highest five cards of the suit", () => {
    const result = evaluateHand([
      { rank: "A", suit: C },
      { rank: "Q", suit: C },
      { rank: "10", suit: C },
      { rank: "4", suit: C },
      { rank: "3", suit: C },
      { rank: "K", suit: H },
      { rank: "9", suit: H },
    ]);

    expect(result.category).toBe("flush");
    expect(result.primaryRanks).toEqual(["A", "Q", "10", "4", "3"]);
  });

  test("higher straight flush wins over lower straight flush", () => {
    const high = evaluateHand([
      { rank: "9", suit: S },
      { rank: "8", suit: S },
      { rank: "7", suit: S },
      { rank: "6", suit: S },
      { rank: "5", suit: S },
      { rank: "2", suit: H },
      { rank: "K", suit: D },
    ]);

    const low = evaluateHand([
      { rank: "8", suit: H },
      { rank: "7", suit: H },
      { rank: "6", suit: H },
      { rank: "5", suit: H },
      { rank: "4", suit: H },
      { rank: "A", suit: C },
      { rank: "2", suit: D },
    ]);

    expect(compareHands(high, low)).toBeGreaterThan(0);
  });
});
