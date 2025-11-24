"use client";

import { CardTag } from "./CardTag";
import { Player } from "@/lib/showdown/game";
import { EvaluatedHand } from "@/lib/poker/hand";

type Props = {
  player: Player;
  selectedOrder: number | null;
  onSelect: (seat: number) => void;
  isWinner: boolean;
  judged: boolean;
  evaluation: EvaluatedHand;
  rank: number | null;
};

export function PlayerCard({
  player,
  selectedOrder,
  onSelect,
  isWinner,
  judged,
  evaluation,
  rank,
}: Props) {
  const selected = selectedOrder !== null;
  const selectionBg =
    selectedOrder === 0
      ? "bg-emerald-900/60"
      : selectedOrder === 1
        ? "bg-emerald-800/50"
        : selectedOrder === 2
          ? "bg-emerald-800/30"
          : "bg-white/5";

  return (
    <article
      data-testid={`player-${player.seat}`}
      data-selected={selected}
      onClick={() => onSelect(player.seat)}
      className={`relative overflow-hidden rounded-xl border ${selectionBg} p-2.5 shadow-md shadow-emerald-900/30 transition hover:border-emerald-300/60 hover:bg-emerald-900/15 cursor-pointer ${
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
