'use client';

import { WinRateResult, AnswerResult } from '@/types';
import { cn } from '@/lib/utils';

interface ResultDisplayProps {
  winRateResult: WinRateResult;
  answerResult: AnswerResult;
  className?: string;
  isRiverConfirmation?: boolean;
  compact?: boolean;
}

export function ResultDisplay({
  winRateResult,
  answerResult,
  className,
  isRiverConfirmation = false,
  compact = false,
}: ResultDisplayProps) {
  const { playerWinRate, computerWinRate, tieRate, totalCombinations, playerWins, computerWins, ties } = winRateResult;
  const { isCorrect, playerAnswer, correctAnswer, round } = answerResult;

  const isPreflop = round === 'preflop';

  const getRiverWinner = () => {
    if (playerWinRate > computerWinRate) return 'player';
    if (computerWinRate > playerWinRate) return 'computer';
    return 'tie';
  };

  return (
    <div className={cn('game-card', compact ? 'p-4' : 'p-6', className)}>
      {/* Result Header */}
      <div className={cn('text-center', compact ? 'mb-3' : 'mb-6')}>
        {isRiverConfirmation ? (
          <div className="animate-bounce-in">
            {getRiverWinner() === 'player' && (
              <div className="flex items-center justify-center gap-3">
                <h2 className={cn('font-black text-gradient-primary text-glow-cyan', compact ? 'text-2xl' : 'text-4xl')}>
                  WINNER!
                </h2>
                <span className="badge badge-primary">+100 XP</span>
              </div>
            )}
            {getRiverWinner() === 'computer' && (
              <h2 className={cn('font-black text-gradient-secondary text-glow-pink', compact ? 'text-2xl' : 'text-4xl')}>
                DEFEAT
              </h2>
            )}
            {getRiverWinner() === 'tie' && (
              <h2 className={cn('font-black text-[#a0aec0]', compact ? 'text-2xl' : 'text-4xl')}>
                DRAW
              </h2>
            )}
          </div>
        ) : (
          <div className="animate-bounce-in">
            {isCorrect ? (
              <div className="flex items-center justify-center gap-3">
                <h2 className={cn('font-black text-[#00ff88] text-glow-green', compact ? 'text-2xl' : 'text-4xl')}>
                  CORRECT!
                </h2>
                <span className="badge badge-gold">+50 XP</span>
              </div>
            ) : (
              <h2 className={cn('font-black text-[#ff4444]', compact ? 'text-2xl' : 'text-4xl')}>
                WRONG!
              </h2>
            )}
          </div>
        )}
      </div>

      {isPreflop ? (
        // Preflop: Hand rank comparison
        <div className={cn(compact ? 'space-y-2' : 'space-y-4')}>
          <div className={cn('text-center text-[#64748b] uppercase tracking-wider', compact ? 'text-xs' : 'text-sm mb-4')}>
            Hand Ranking Comparison
          </div>

          <div className={cn('flex items-center justify-between', compact ? 'gap-2' : 'gap-4')}>
            {/* Player */}
            <div className={cn(
              'flex-1 rounded-xl text-center',
              compact ? 'p-2' : 'p-4',
              playerWinRate > 0
                ? 'bg-gradient-to-br from-[#00d4ff]/20 to-[#0066ff]/20 border border-[#00d4ff]/30'
                : 'bg-[#1a1f35] border border-[#1a1f35]'
            )}>
              <div className={cn('text-[#64748b]', compact ? 'text-xs' : 'text-sm mb-1')}>YOU</div>
              {answerResult.playerHandRank && (
                <>
                  <div className={cn('font-bold text-white', compact ? 'text-sm' : 'text-lg')}>
                    {answerResult.playerHandRank.name}
                  </div>
                  <div className={cn(
                    'font-black',
                    compact ? 'text-lg' : 'text-2xl mt-1',
                    playerWinRate > 0 ? 'text-[#00d4ff]' : 'text-[#64748b]'
                  )}>
                    #{answerResult.playerHandRank.rank}
                  </div>
                </>
              )}
              {playerWinRate > 0 && (
                <div className={cn('text-[#ffd700] font-semibold', compact ? 'text-xs' : 'mt-2 text-sm')}>WINNER</div>
              )}
            </div>

            <div className={cn('font-black text-[#64748b]', compact ? 'text-lg' : 'text-2xl')}>VS</div>

            {/* Computer */}
            <div className={cn(
              'flex-1 rounded-xl text-center',
              compact ? 'p-2' : 'p-4',
              computerWinRate > 0
                ? 'bg-gradient-to-br from-[#ff4d94]/20 to-[#ff0080]/20 border border-[#ff4d94]/30'
                : 'bg-[#1a1f35] border border-[#1a1f35]'
            )}>
              <div className={cn('text-[#64748b]', compact ? 'text-xs' : 'text-sm mb-1')}>DEALER</div>
              {answerResult.computerHandRank && (
                <>
                  <div className={cn('font-bold text-white', compact ? 'text-sm' : 'text-lg')}>
                    {answerResult.computerHandRank.name}
                  </div>
                  <div className={cn(
                    'font-black',
                    compact ? 'text-lg' : 'text-2xl mt-1',
                    computerWinRate > 0 ? 'text-[#ff4d94]' : 'text-[#64748b]'
                  )}>
                    #{answerResult.computerHandRank.rank}
                  </div>
                </>
              )}
              {computerWinRate > 0 && (
                <div className={cn('text-[#ffd700] font-semibold', compact ? 'text-xs' : 'mt-2 text-sm')}>WINNER</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Flop/Turn/River: Win rate comparison
        <div className={cn(compact ? 'space-y-3' : 'space-y-6')}>
          {!compact && (
            <div className="text-center text-[#64748b] text-sm uppercase tracking-wider">
              Win Probability Clash
            </div>
          )}

          {/* Win Rate Display */}
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-xs text-[#64748b] uppercase mb-1">You</div>
              <div className={cn('font-black text-[#00d4ff]', compact ? 'text-2xl' : 'text-3xl')}>
                {playerWinRate.toFixed(1)}%
              </div>
            </div>
            <div className={compact ? 'px-2' : 'px-4'}>
              <div className={cn(
                'rounded-full bg-[#1a1f35] border-2 border-[#64748b] flex items-center justify-center',
                compact ? 'w-10 h-10' : 'w-12 h-12'
              )}>
                <span className="text-[#64748b] font-bold text-sm">VS</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[#64748b] uppercase mb-1">Dealer</div>
              <div className={cn('font-black text-[#ff4d94]', compact ? 'text-2xl' : 'text-3xl')}>
                {computerWinRate.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Win Rate Bar */}
          <div className="relative">
            <div className="winrate-bar">
              <div
                className="winrate-player"
                style={{ width: `${playerWinRate}%` }}
              >
                {playerWinRate > 15 && <span>{playerWinRate.toFixed(0)}%</span>}
              </div>
              <div
                className="winrate-computer"
                style={{ width: `${computerWinRate}%` }}
              >
                {computerWinRate > 15 && <span>{computerWinRate.toFixed(0)}%</span>}
              </div>
            </div>
            {tieRate > 5 && (
              <div className="text-center mt-1 text-[#64748b] text-xs">
                Tie: {tieRate.toFixed(1)}%
              </div>
            )}
          </div>

          {/* Stats - hide in compact mode */}
          {!compact && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0f1424] rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-[#00d4ff] tabular-nums">{playerWins.toLocaleString()}</div>
                <div className="text-xs text-[#64748b] uppercase">Win</div>
              </div>
              <div className="bg-[#0f1424] rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-[#64748b] tabular-nums">{ties.toLocaleString()}</div>
                <div className="text-xs text-[#64748b] uppercase">Ties</div>
              </div>
              <div className="bg-[#0f1424] rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-[#ff4d94] tabular-nums">{computerWins.toLocaleString()}</div>
                <div className="text-xs text-[#64748b] uppercase">Loss</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wrong Answer Feedback */}
      {!isCorrect && !isRiverConfirmation && (
        <div className={cn(
          'bg-[#ff4444]/10 border border-[#ff4444]/30 rounded-xl',
          compact ? 'mt-3 p-2' : 'mt-6 p-4'
        )}>
          <div className={cn('flex justify-between items-center', compact ? 'text-xs' : 'text-sm')}>
            <div>
              <span className="text-[#64748b]">Your answer: </span>
              <span className="text-white font-bold">
                {typeof playerAnswer === 'number'
                  ? `${playerAnswer}%`
                  : playerAnswer === 'player'
                  ? 'You'
                  : 'Dealer'}
              </span>
            </div>
            <div>
              <span className="text-[#64748b]">Correct: </span>
              <span className="text-[#00ff88] font-bold">
                {typeof correctAnswer === 'number'
                  ? `${correctAnswer.toFixed(1)}%`
                  : correctAnswer === 'player'
                  ? 'You'
                  : 'Dealer'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Detailed analysis for game over
export function DetailedAnalysis({
  winRateResult,
  className,
}: {
  winRateResult: WinRateResult;
  className?: string;
}) {
  const { playerWinRate, computerWinRate, playerWins, computerWins, ties, totalCombinations } = winRateResult;

  return (
    <div className={cn('game-card p-6', className)}>
      <h3 className="text-lg font-bold text-white mb-4">Detailed Analysis</h3>

      <div className="space-y-4">
        {/* Visual breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#0066ff]" />
            <span className="text-[#a0aec0] flex-1">Your Wins</span>
            <span className="text-[#00d4ff] font-mono font-bold">
              {playerWins.toLocaleString()} ({playerWinRate.toFixed(2)}%)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#ff4d94] to-[#ff0080]" />
            <span className="text-[#a0aec0] flex-1">Dealer Wins</span>
            <span className="text-[#ff4d94] font-mono font-bold">
              {computerWins.toLocaleString()} ({computerWinRate.toFixed(2)}%)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#64748b]" />
            <span className="text-[#a0aec0] flex-1">Ties</span>
            <span className="text-[#64748b] font-mono font-bold">
              {ties.toLocaleString()} ({((ties / totalCombinations) * 100).toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5">
          <div className="flex justify-between text-sm">
            <span className="text-[#64748b]">Total Combinations</span>
            <span className="text-white font-mono">{totalCombinations.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
