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
      className="flex h-16 w-12 flex-col items-center justify-center rounded-lg border border-white/10 bg-white/10 shadow-lg shadow-emerald-900/50 backdrop-blur-sm"
    >
      <span className={`text-lg font-semibold leading-none ${color}`}>{card.rank}</span>
      <span className={`text-base ${color}`}>{suitSymbols[card.suit]}</span>
    </div>
  );
}

function PlayerCard({
  player,
  selectedSeat,
  onSelect,
  isWinner,
  judged,
  evaluation,
}: {
  player: Player;
  selectedSeat: number | null;
  onSelect: (seat: number) => void;
  isWinner: boolean;
  judged: boolean;
  evaluation: EvaluatedHand;
}) {
  const selected = selectedSeat === player.seat;

  return (
    <article
      data-testid={`player-${player.seat}`}
      data-selected={selected}
      onClick={() => onSelect(player.seat)}
      className={`rounded-xl border bg-white/5 p-4 shadow-lg shadow-emerald-900/40 transition hover:border-emerald-300/60 hover:bg-emerald-900/20 cursor-pointer ${
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
      <header className="mb-3 flex items-center justify-between text-sm uppercase tracking-[0.08em] text-slate-200">
        <span className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
            {player.seat}
          </span>
          {player.name}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-200">
          {isWinner && <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">Best</span>}
          Hole Cards
        </span>
      </header>
      <div className="flex items-center gap-2">
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
        <div className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
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
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
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

  const activeWinners = judgedWinners ?? [];
  const selectedIsBest = selectedSeat !== null && activeWinners.includes(selectedSeat);
  const judged = judgedWinners !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-black text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 lg:px-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Showdown View</p>
          <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
            10人プレイヤーのハンドが開示されたテーブル
          </h1>
          <p className="text-base text-slate-300">
            ボード5枚と各プレイヤーのホールカードを一覧表示。次のステップで役判定ロジックと勝者ハイライトを追加する。
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-emerald-100">
            <span className="text-xs uppercase tracking-[0.18em] text-emerald-200">Selected</span>
            <span data-testid="selected-seat" className="font-semibold">
              {selectedSeat ?? "未選択"}
            </span>
            <span data-testid="selected-strength" className="text-xs text-slate-300">
              {judged
                ? selectedSeat === null
                  ? "未選択"
                  : selectedIsBest
                    ? "最強のハンドです"
                    : "最強ではありません"
                : "未判定"}
            </span>
            <button
              type="button"
              data-testid="judge-button"
              onClick={() => setJudgedWinners([...winners])}
              className="ml-3 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500"
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

        <section className="rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-900/60 via-emerald-950/70 to-black p-6 shadow-xl shadow-emerald-900/40">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Board</h2>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-emerald-200">
              River
            </span>
          </div>
          <div data-testid="board-section" className="flex flex-wrap gap-3">
            {board.map((card) => (
              <CardTag key={`${card.rank}-${card.suit}`} card={card} context="board" />
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <PlayerCard
              key={player.seat}
              player={player}
              selectedSeat={selectedSeat}
              onSelect={setSelectedSeat}
              isWinner={activeWinners.includes(player.seat)}
              judged={judged}
              evaluation={evaluations.find((e) => e.seat === player.seat)!.result}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
