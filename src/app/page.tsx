"use client";

import { BoardSection } from "@/components/showdown/BoardSection";
import { PlayerCard } from "@/components/showdown/PlayerCard";
import { SelectionBar } from "@/components/showdown/SelectionBar";
import { useShowdownGame } from "@/lib/showdown/game";

export default function Home() {
  const {
    board,
    players,
    table: { evaluations, winners, bestResult, rankMap },
    selectedSeats,
    activeWinners,
    judged,
    selectionHitCount,
    handleSelect,
    judge,
  } = useShowdownGame();

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

          <SelectionBar
            selectedSeats={selectedSeats}
            activeWinners={activeWinners}
            judged={judged}
            selectionHitCount={selectionHitCount}
            onJudge={() => judge()}
          />

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

        <BoardSection board={board} />

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
