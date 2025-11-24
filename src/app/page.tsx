"use client";

import { useMemo, useState } from "react";
import { compareHands, evaluateHand, type EvaluatedHand } from "@/lib/poker/hand";

type Suit = "spades" | "hearts" | "diamonds" | "clubs";

type Card = {
  rank: string;
  suit: Suit;
};

type Player = {
  seat: number;
  name: string;
  cards: [Card, Card];
};

type CardContext = "board" | "hole";

const suitSymbols: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

const suitColors: Record<Suit, string> = {
  spades: "text-white",
  clubs: "text-white",
  hearts: "text-red-400",
  diamonds: "text-red-400",
};

function CardTag({
  card,
  context,
  ownerSeat,
}: {
  card: Card;
  context: CardContext;
  ownerSeat?: number;
}) {
  const color = suitColors[card.suit];
  const dataTestId =
    context === "board"
      ? `board-card-${card.rank}-${card.suit}`
      : `hole-card-${ownerSeat}-${card.rank}-${card.suit}`;
  return (
    <div
      data-testid={dataTestId}
      className="flex h-14 w-10 flex-col items-center justify-center rounded-lg border border-white/10 bg-white/10 shadow-lg shadow-emerald-900/40 backdrop-blur-sm sm:h-16 sm:w-12"
    >
      <span className={`text-base font-semibold leading-none sm:text-lg ${color}`}>{card.rank}</span>
      <span className={`text-sm sm:text-base ${color}`}>{suitSymbols[card.suit]}</span>
    </div>
  );
}

function PlayerCard({
  player,
  selectedOrder,
  onSelect,
  isWinner,
  judged,
  evaluation,
  rank,
}: {
  player: Player;
  selectedOrder: number | null;
  onSelect: (seat: number) => void;
  isWinner: boolean;
  judged: boolean;
  evaluation: EvaluatedHand;
  rank: number | null;
}) {
  const selected = selectedOrder !== null;

  return (
    <article
      data-testid={`player-${player.seat}`}
      data-selected={selected}
      onClick={() => onSelect(player.seat)}
      className={`rounded-xl border bg-white/5 p-2.5 shadow-md shadow-emerald-900/30 transition hover:border-emerald-300/60 hover:bg-emerald-900/15 cursor-pointer ${
        selected || isWinner ? "border-emerald-400 ring-2 ring-emerald-500/60" : "border-white/5"
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(player.seat);
        }
      }}
    >
      <header className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.08em] text-slate-200 sm:text-sm">
        <span className="flex items-center gap-2">
          <span className="inline-flex h-6 items-center justify-center rounded-full bg-emerald-700 px-2 text-[10px] font-bold text-white sm:text-xs">
            {`Player ${player.seat}`}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-200">
          {selectedOrder !== null && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
              #{selectedOrder + 1}
            </span>
          )}
          {judged && rank !== null && (
            <span className="rounded-full bg-slate-200/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-50">
              Rank {rank}
            </span>
          )}
          {isWinner && (
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
              Best
            </span>
          )}
        </span>
      </header>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {player.cards.map((card) => (
          <CardTag
            key={`${card.rank}-${card.suit}-${player.seat}`}
            card={card}
            context="hole"
            ownerSeat={player.seat}
          />
        ))}
      </div>

      {judged && (
        <div className="mt-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] text-slate-200 sm:text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-100">Best Hand</span>
            {isWinner && <span className="text-[10px] uppercase tracking-[0.12em] text-emerald-200">Top</span>}
          </div>
          <div className="mt-1 text-slate-100">
            {evaluation.category} ・ {evaluation.primaryRanks.join(" ")}
          </div>
          {evaluation.kickers && evaluation.kickers.length > 0 && (
            <div className="text-slate-400">Kicker: {evaluation.kickers.join(" ")}</div>
          )}
        </div>
      )}
    </article>
  );
}

function buildDeck(): Card[] {
  const ranks = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
  const suits: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function dealGame(numPlayers = 10) {
  const deck = shuffle(buildDeck());
  const board = deck.slice(0, 5);
  const playerCards = deck.slice(5, 5 + numPlayers * 2);
  const players: Player[] = Array.from({ length: numPlayers }, (_, idx) => {
    const offset = idx * 2;
    return {
      seat: idx + 1,
      name: `Player ${idx + 1}`,
      cards: [playerCards[offset], playerCards[offset + 1]],
    } as Player;
  });
  return { board, players };
}

export default function Home() {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [{ board, players }] = useState(() => dealGame());
  const [judgedWinners, setJudgedWinners] = useState<number[] | null>(null);
  const evaluations = useMemo(
    () =>
      players.map((player) => ({
        seat: player.seat,
        result: evaluateHand([...board, ...player.cards]),
      })),
    [board, players]
  );

  const { winners, bestResult } = useMemo(() => {
    let best: { seat: number; result: EvaluatedHand } | null = null;
    const winnerSeats: number[] = [];
    for (const entry of evaluations) {
      if (!best) {
        best = entry;
        winnerSeats.push(entry.seat);
        continue;
      }
      const cmp = compareHands(entry.result, best.result);
      if (cmp > 0) {
        best = entry;
        winnerSeats.splice(0, winnerSeats.length, entry.seat);
      } else if (cmp === 0) {
        winnerSeats.push(entry.seat);
      }
    }
    return { winners: winnerSeats, bestResult: best?.result };
  }, [evaluations]);

  const rankMap = useMemo(() => {
    const sorted = [...evaluations].sort((a, b) => compareHands(b.result, a.result));
    const map = new Map<number, number>();
    let currentRank = 1;
    sorted.forEach((entry, idx) => {
      if (idx > 0) {
        const cmp = compareHands(entry.result, sorted[idx - 1].result);
        if (cmp !== 0) currentRank = idx + 1;
      }
      map.set(entry.seat, currentRank);
    });
    return map;
  }, [evaluations]);

  const activeWinners = judgedWinners ?? [];
  const judged = judgedWinners !== null;
  const selectedIsBest = selectedSeats.some((s) => activeWinners.includes(s));

  const handleSelect = (seat: number) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seat)) {
        return prev.filter((s) => s !== seat);
      }
      if (prev.length < 3) return [...prev, seat];
      // replace最古 with new to keep最新3
      return [...prev.slice(1), seat];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-black text-white">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:gap-7 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Showdown View</p>
          <h1 className="text-xl font-semibold leading-tight text-white sm:text-2xl">
            10人プレイヤーのハンドが開示されたテーブル
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            ボード5枚と各プレイヤーのホールカードを一覧表示。ジャッジすると最強ハンドをハイライト。
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-emerald-100 sm:px-4">
            <span className="text-xs uppercase tracking-[0.18em] text-emerald-200">Selected</span>
            <span data-testid="selected-seat" className="font-semibold flex items-center gap-1">
              {selectedSeats.length === 0 ? "未選択" : `${selectedSeats[0]}`}
            </span>
            <span data-testid="selected-strength" className="text-xs text-slate-300">
              {judged
                ? selectedSeats.length === 0
                  ? "未選択"
                  : selectedIsBest
                    ? "選択の中に最強が含まれます"
                    : "選択の中に最強は含まれません"
                : "未判定"}
            </span>
            <button
              type="button"
              data-testid="judge-button"
              onClick={() => setJudgedWinners([...winners])}
              className="ml-auto rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 sm:ml-3"
            >
              Judge
            </button>
          </div>

          {judged && (
            <div
              data-testid="judge-result"
              className="mt-2 inline-flex flex-wrap items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-50"
            >
              <span className="text-xs uppercase tracking-[0.18em] text-emerald-200">Result</span>
              <span className="font-semibold">
                最強プレイヤー:{" "}
                {activeWinners.length
                  ? activeWinners.map((seat) => `Player ${seat}`).join(", ")
                  : "なし"}
              </span>
              {bestResult && (
                <span className="text-emerald-100">
                  役: {bestResult.category} ({bestResult.primaryRanks.join(" ")})
                </span>
              )}
            </div>
          )}
        </header>

        <section className="sticky top-2 z-20 rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-900/70 via-emerald-950/80 to-black p-3 shadow-xl shadow-emerald-900/50 backdrop-blur sm:p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white sm:text-lg">Board</h2>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-emerald-200">
              River
            </span>
          </div>
          <div
            data-testid="board-section"
            className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3 sm:overflow-visible"
          >
            {board.map((card) => (
              <CardTag key={`${card.rank}-${card.suit}`} card={card} context="board" />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2 sm:gap-3">
          {players.map((player) => (
            <PlayerCard
              key={player.seat}
              player={player}
              selectedOrder={(() => {
                const idx = selectedSeats.indexOf(player.seat);
                return idx === -1 ? null : idx;
              })()}
              onSelect={handleSelect}
              isWinner={activeWinners.includes(player.seat)}
              judged={judged}
              rank={judged ? rankMap.get(player.seat) ?? null : null}
              evaluation={evaluations.find((e) => e.seat === player.seat)!.result}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
