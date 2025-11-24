"use client";

import { useState } from "react";

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

const board: Card[] = [
  { rank: "A", suit: "hearts" },
  { rank: "K", suit: "diamonds" },
  { rank: "Q", suit: "spades" },
  { rank: "J", suit: "clubs" },
  { rank: "9", suit: "hearts" },
];

const players: Player[] = [
  { seat: 1, name: "Player 1", cards: [{ rank: "10", suit: "hearts" }, { rank: "8", suit: "clubs" }] },
  { seat: 2, name: "Player 2", cards: [{ rank: "A", suit: "clubs" }, { rank: "A", suit: "spades" }] },
  { seat: 3, name: "Player 3", cards: [{ rank: "7", suit: "diamonds" }, { rank: "7", suit: "spades" }] },
  { seat: 4, name: "Player 4", cards: [{ rank: "Q", suit: "diamonds" }, { rank: "10", suit: "spades" }] },
  { seat: 5, name: "Player 5", cards: [{ rank: "K", suit: "clubs" }, { rank: "K", suit: "spades" }] },
  { seat: 6, name: "Player 6", cards: [{ rank: "5", suit: "hearts" }, { rank: "5", suit: "clubs" }] },
  { seat: 7, name: "Player 7", cards: [{ rank: "J", suit: "spades" }, { rank: "2", suit: "diamonds" }] },
  { seat: 8, name: "Player 8", cards: [{ rank: "4", suit: "clubs" }, { rank: "4", suit: "hearts" }] },
  { seat: 9, name: "Player 9", cards: [{ rank: "9", suit: "clubs" }, { rank: "3", suit: "hearts" }] },
  { seat: 10, name: "Player 10", cards: [{ rank: "6", suit: "diamonds" }, { rank: "6", suit: "clubs" }] },
];

const suitSymbols: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

const suitColors: Record<Suit, string> = {
  spades: "text-slate-100",
  clubs: "text-emerald-200",
  hearts: "text-rose-300",
  diamonds: "text-amber-200",
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
}: {
  player: Player;
  selectedSeat: number | null;
  onSelect: (seat: number) => void;
}) {
  const selected = selectedSeat === player.seat;

  return (
    <article
      data-testid={`player-${player.seat}`}
      data-selected={selected}
      onClick={() => onSelect(player.seat)}
      className={`rounded-xl border bg-white/5 p-4 shadow-lg shadow-emerald-900/40 transition hover:border-emerald-300/60 hover:bg-emerald-900/20 cursor-pointer ${
        selected ? "border-emerald-400 ring-2 ring-emerald-500/60" : "border-white/5"
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
        <span className="text-xs text-emerald-200">Hole Cards</span>
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
    </article>
  );
}

export default function Home() {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

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
          </div>
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
            />
          ))}
        </section>
      </main>
    </div>
  );
}
