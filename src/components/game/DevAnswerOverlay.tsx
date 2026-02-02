'use client';

import { useGameStore } from '@/stores/gameStore';
import { evaluateStartingHand, compareStartingHands } from '@/lib/poker/starting-hands';
import { DIFFICULTY_CONFIG } from '@/types';

interface DevAnswerOverlayProps {
  currentWinRate: {
    playerWinRate: number;
    computerWinRate: number;
    tieRate: number;
  } | null;
}

export function DevAnswerOverlay({ currentWinRate }: DevAnswerOverlayProps) {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const { currentRound, playerHand, computerHand, difficulty, status } = useGameStore();

  // Don't show if not in answering state or no hands
  if (status !== 'answering' || !playerHand || !computerHand) {
    return null;
  }

  const config = DIFFICULTY_CONFIG[difficulty];

  let answerInfo: React.ReactNode;

  if (currentRound === 'preflop') {
    const playerInfo = evaluateStartingHand(playerHand);
    const computerInfo = evaluateStartingHand(computerHand);
    const comparison = compareStartingHands(playerHand, computerHand);
    const winner = comparison < 0 ? 'player' : comparison > 0 ? 'computer' : 'tie';

    answerInfo = (
      <>
        <div className="text-xs text-slate-400 mb-1">PRE-FLOP</div>
        <div className="flex justify-between text-xs">
          <span>You: {playerInfo.name}</span>
          <span className="text-slate-500">#{playerInfo.rank}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Dealer: {computerInfo.name}</span>
          <span className="text-slate-500">#{computerInfo.rank}</span>
        </div>
        <div className="mt-1 pt-1 border-t border-white/10 text-sm font-bold">
          Answer: <span className={winner === 'player' ? 'text-emerald-400' : 'text-red-400'}>
            {winner === 'player' ? 'ME' : winner === 'computer' ? 'DEALER' : 'TIE'}
          </span>
        </div>
      </>
    );
  } else if (currentWinRate) {
    const tolerance = config.tolerance ?? 0;
    const minAnswer = Math.max(0, Math.round(currentWinRate.playerWinRate) - tolerance);
    const maxAnswer = Math.min(100, Math.round(currentWinRate.playerWinRate) + tolerance);

    answerInfo = (
      <>
        <div className="text-xs text-slate-400 mb-1">{currentRound.toUpperCase()}</div>
        <div className="text-xs space-y-0.5">
          <div className="flex justify-between">
            <span>Player:</span>
            <span className="text-emerald-400">{currentWinRate.playerWinRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Computer:</span>
            <span className="text-red-400">{currentWinRate.computerWinRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Tie:</span>
            <span className="text-slate-400">{currentWinRate.tieRate.toFixed(1)}%</span>
          </div>
        </div>
        <div className="mt-1 pt-1 border-t border-white/10 text-sm font-bold">
          Answer: <span className="text-amber-400">{Math.round(currentWinRate.playerWinRate)}%</span>
          {tolerance > 0 && (
            <span className="text-xs text-slate-500 ml-1">
              (±{tolerance}% → {minAnswer}~{maxAnswer}%)
            </span>
          )}
        </div>
      </>
    );
  } else {
    answerInfo = (
      <div className="text-xs text-slate-500">Calculating...</div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-white/10 min-w-[180px] select-none pointer-events-none">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded font-mono">DEV</span>
        <span className="text-[10px] text-slate-500">{difficulty}</span>
      </div>
      {answerInfo}
    </div>
  );
}
