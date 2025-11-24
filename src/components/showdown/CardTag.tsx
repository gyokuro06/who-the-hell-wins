"use client";

import { Card } from "@/lib/poker/domain";

type CardContext = "board" | "hole";

const suitSymbols: Record<Card["suit"], string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

const suitColors: Record<Card["suit"], string> = {
  spades: "text-white",
  clubs: "text-white",
  hearts: "text-red-400",
  diamonds: "text-red-400",
};

export function CardTag({
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
