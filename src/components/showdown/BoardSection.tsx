"use client";

import { CardTag } from "./CardTag";
import { Card } from "@/lib/poker/domain";

type Props = {
  board: Card[];
};

export function BoardSection({ board }: Props) {
  return (
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
  );
}
