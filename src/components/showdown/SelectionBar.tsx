"use client";

import { MouseEventHandler } from "react";

type Props = {
  selectedSeats: number[];
  activeWinners: number[];
  judged: boolean;
  selectionHitCount: number;
  onJudge: MouseEventHandler<HTMLButtonElement>;
};

export function SelectionBar({ selectedSeats, activeWinners, judged, selectionHitCount, onJudge }: Props) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-emerald-100 sm:px-4">
      <span className="text-xs uppercase tracking-[0.18em] text-emerald-200">Selected</span>
      <span data-testid="selected-seat" className="font-semibold">
        {selectedSeats.length === 0 ? "未選択" : `${selectedSeats[0]}`}
      </span>
      {selectedSeats.length > 0 && (
        <span className="flex items-center gap-1">
          {selectedSeats.map((s) => (
            <span
              key={s}
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeWinners.includes(s) && judged ? "bg-emerald-600/60 text-white" : "bg-emerald-700/30 text-white"
              }`}
            >
              P{s}
            </span>
          ))}
        </span>
      )}
      <span data-testid="selected-strength" className="text-xs text-slate-300">
        {judged
          ? selectedSeats.length === 0
            ? "未選択"
            : selectionHitCount === selectedSeats.length && selectionHitCount === activeWinners.length
              ? "完全正解"
              : selectionHitCount > 0
                ? "部分正解"
                : "不正解"
          : "未判定"}
      </span>
      <button
        type="button"
        data-testid="judge-button"
        onClick={onJudge}
        className="ml-auto rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 sm:ml-3"
      >
        Judge
      </button>
    </div>
  );
}
