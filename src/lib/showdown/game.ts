import { useMemo, useState } from "react";
import { compareHands, evaluateHand, type Card, type EvaluatedHand } from "../poker/hand";

export type Player = {
  seat: number;
  name: string;
  cards: [Card, Card];
};

export type Deal = {
  board: Card[];
  players: Player[];
};

export type TableEvaluation = {
  evaluations: { seat: number; result: EvaluatedHand }[];
  winners: number[];
  bestResult?: EvaluatedHand;
  rankMap: Map<number, number>;
};

const suits: Card["suit"][] = ["spades", "hearts", "diamonds", "clubs"];
const ranks = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function dealGame(numPlayers = 10): Deal {
  const deck = shuffle(buildDeck());
  const board = deck.slice(0, 5);
  const playerCards = deck.slice(5, 5 + numPlayers * 2);
  const players: Player[] = Array.from({ length: numPlayers }, (_, idx) => {
    const offset = idx * 2;
    return {
      seat: idx + 1,
      name: `Player ${idx + 1}`,
      cards: [playerCards[offset], playerCards[offset + 1]],
    };
  });
  return { board, players };
}

export function evaluateTable(players: Player[], board: Card[]): TableEvaluation {
  const evaluations = players.map((player) => ({
    seat: player.seat,
    result: evaluateHand([...board, ...player.cards]),
  }));

  const sorted = [...evaluations].sort((a, b) => compareHands(b.result, a.result));
  const winners: number[] = [];
  let bestResult: EvaluatedHand | undefined;
  if (sorted.length) {
    bestResult = sorted[0].result;
    winners.push(sorted[0].seat);
    for (let i = 1; i < sorted.length; i += 1) {
      if (compareHands(sorted[i].result, bestResult) === 0) winners.push(sorted[i].seat);
      else break;
    }
  }

  const rankMap = new Map<number, number>();
  let currentRank = 1;
  sorted.forEach((entry, idx) => {
    if (idx > 0) {
      const cmp = compareHands(entry.result, sorted[idx - 1].result);
      if (cmp !== 0) currentRank = idx + 1;
    }
    rankMap.set(entry.seat, currentRank);
  });

  return { evaluations, winners, bestResult, rankMap };
}

export function updateSelection(prev: number[], seat: number, limit = 3): number[] {
  if (prev.includes(seat)) return prev.filter((s) => s !== seat);
  if (prev.length < limit) return [...prev, seat];
  return [...prev.slice(1), seat];
}

export function useShowdownGame(numPlayers = 10) {
  const [{ board, players }] = useState(() => dealGame(numPlayers));
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [judgedWinners, setJudgedWinners] = useState<number[] | null>(null);

  const table = useMemo(() => evaluateTable(players, board), [players, board]);
  const activeWinners = judgedWinners ?? [];
  const judged = judgedWinners !== null;

  const selectionHitCount = selectedSeats.filter((s) => activeWinners.includes(s)).length;
  const selectedIsBest = selectionHitCount > 0;

  const handleSelect = (seat: number) => setSelectedSeats((prev) => updateSelection(prev, seat));
  const judge = () => setJudgedWinners([...table.winners]);

  return {
    board,
    players,
    table,
    selectedSeats,
    setSelectedSeats,
    judgedWinners,
    setJudgedWinners,
    activeWinners,
    judged,
    selectionHitCount,
    selectedIsBest,
    handleSelect,
    judge,
  };
}
