'use client';

import { Dialog, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { WinRateResult, AnswerResult, GameRound, Difficulty } from '@/types';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface ResultDialogProps {
  isOpen: boolean;
  winRateResult: WinRateResult;
  answerResult: AnswerResult;
  currentRound: GameRound;
  onContinue: () => void;
  onViewRiver?: () => void;
  isViewingRiver?: boolean;
  difficulty?: Difficulty;
}

export function ResultDialog({
  isOpen,
  winRateResult,
  answerResult,
  currentRound,
  onContinue,
  onViewRiver,
  isViewingRiver = false,
  difficulty,
}: ResultDialogProps) {
  const { t } = useTranslation();
  const { playerWinRate, computerWinRate, tieRate, playerWins, computerWins, ties } = winRateResult;
  const { isCorrect, playerAnswer, correctAnswer, round } = answerResult;

  const isPreflop = round === 'preflop';
  const isRiver = currentRound === 'river';
  const isTurn = currentRound === 'turn';

  // Get next difficulty
  const getNextDifficulty = (): Difficulty | null => {
    if (!difficulty) return null;
    const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'expert', 'god'];
    const currentIndex = difficulties.indexOf(difficulty);
    if (currentIndex < difficulties.length - 1) {
      return difficulties[currentIndex + 1];
    }
    return null; // Already at god level
  };

  const nextDifficulty = getNextDifficulty();

  const getRiverWinner = () => {
    if (playerWinRate > computerWinRate) return 'player';
    if (computerWinRate > playerWinRate) return 'computer';
    return 'tie';
  };

  return (
    <Dialog isOpen={isOpen} onClose={() => {}} className="max-w-lg">
      <DialogContent className="p-0">
        {/* Result Header - hide when viewing river */}
        {!isViewingRiver && (
          <div className="text-center pt-8 pb-4">
            {isRiver ? (
              <div className="animate-bounce-in">
                {getRiverWinner() === 'player' && (
                  <div className="flex flex-col items-center gap-2">
                    <h2 className="text-5xl font-black text-gradient-primary text-glow-cyan">
                      {t.results.winner}
                    </h2>
                    <span className="badge badge-primary text-base px-4 py-1">{t.results.xpGain.replace('{amount}', '100')}</span>
                  </div>
                )}
                {getRiverWinner() === 'computer' && (
                  <h2 className="text-5xl font-black text-gradient-secondary text-glow-pink">
                    {t.results.defeat}
                  </h2>
                )}
                {getRiverWinner() === 'tie' && (
                  <h2 className="text-5xl font-black text-[#a0aec0]">
                    {t.results.draw}
                  </h2>
                )}
              </div>
            ) : (
              <div className="animate-bounce-in">
                {isCorrect ? (
                  <div className="flex flex-col items-center gap-2">
                    <h2 className="text-5xl font-black text-[#00ff88] text-glow-green">
                      {t.results.correct}
                    </h2>
                    <span className="badge badge-gold text-base px-4 py-1">{t.results.xpGain.replace('{amount}', '50')}</span>
                  </div>
                ) : (
                  <h2 className="text-5xl font-black text-[#ff4444]">
                    {t.results.wrong}
                  </h2>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-6">
          {isPreflop ? (
            // Preflop: Hand rank comparison
            <div className="space-y-4">
              <div className="text-center text-[#64748b] text-sm uppercase tracking-wider">
                {t.results.handRankingComparison}
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Player */}
                <div className={cn(
                  'flex-1 rounded-xl text-center p-5',
                  playerWinRate > 0
                    ? 'bg-gradient-to-br from-[#00d4ff]/20 to-[#0066ff]/20 border border-[#00d4ff]/30'
                    : 'bg-[#1a1f35] border border-[#1a1f35]'
                )}>
                  <div className="text-[#64748b] text-sm mb-2">{t.game.labels.you}</div>
                  {answerResult.playerHandRank && (
                    <>
                      <div className="font-bold text-white text-xl">
                        {answerResult.playerHandRank.name}
                      </div>
                      <div className={cn(
                        'font-black text-3xl mt-2',
                        playerWinRate > 0 ? 'text-[#00d4ff]' : 'text-[#64748b]'
                      )}>
                        #{answerResult.playerHandRank.rank}
                      </div>
                    </>
                  )}
                  {playerWinRate > 0 && (
                    <div className="text-[#ffd700] font-semibold mt-2">{t.results.winner}</div>
                  )}
                </div>

                <div className="font-black text-[#64748b] text-3xl">{t.game.labels.vs}</div>

                {/* Computer */}
                <div className={cn(
                  'flex-1 rounded-xl text-center p-5',
                  computerWinRate > 0
                    ? 'bg-gradient-to-br from-[#ff4d94]/20 to-[#ff0080]/20 border border-[#ff4d94]/30'
                    : 'bg-[#1a1f35] border border-[#1a1f35]'
                )}>
                  <div className="text-[#64748b] text-sm mb-2">{t.game.labels.dealer}</div>
                  {answerResult.computerHandRank && (
                    <>
                      <div className="font-bold text-white text-xl">
                        {answerResult.computerHandRank.name}
                      </div>
                      <div className={cn(
                        'font-black text-3xl mt-2',
                        computerWinRate > 0 ? 'text-[#ff4d94]' : 'text-[#64748b]'
                      )}>
                        #{answerResult.computerHandRank.rank}
                      </div>
                    </>
                  )}
                  {computerWinRate > 0 && (
                    <div className="text-[#ffd700] font-semibold mt-2">{t.results.winner}</div>
                  )}
                </div>
              </div>
            </div>
          ) : isViewingRiver && isRiver ? (
            // View River Mode: Show next difficulty info
            <div className="text-center py-6">
              {nextDifficulty && (
                <p className="text-[#64748b] text-lg">
                  {t.results.nextIs} <span className="text-white font-bold">{t.difficulty[nextDifficulty]}</span>{t.results.nextIsSuffix}
                </p>
              )}
            </div>
          ) : (
            // Flop/Turn/River: Win rate comparison
            <div className="space-y-5">
              <div className="text-center text-[#64748b] text-sm uppercase tracking-wider">
                {t.results.winProbability}
              </div>

              {/* Win Rate Display */}
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-sm text-[#64748b] uppercase mb-1">{t.game.labels.you}</div>
                  <div className="font-black text-[#00d4ff] text-4xl">
                    {playerWinRate.toFixed(1)}%
                  </div>
                </div>
                <div className="px-4">
                  <div className="rounded-full bg-[#1a1f35] border-2 border-[#64748b] w-14 h-14 flex items-center justify-center">
                    <span className="text-[#64748b] font-bold">{t.game.labels.vs}</span>
                  </div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-sm text-[#64748b] uppercase mb-1">{t.game.labels.dealer}</div>
                  <div className="font-black text-[#ff4d94] text-4xl">
                    {computerWinRate.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Win Rate Bar */}
              <div className="relative">
                <div className="winrate-bar h-4">
                  <div
                    className="winrate-player"
                    style={{ width: `${playerWinRate}%` }}
                  >
                    {playerWinRate > 15 && <span className="text-sm">{playerWinRate.toFixed(0)}%</span>}
                  </div>
                  <div
                    className="winrate-computer"
                    style={{ width: `${computerWinRate}%` }}
                  >
                    {computerWinRate > 15 && <span className="text-sm">{computerWinRate.toFixed(0)}%</span>}
                  </div>
                </div>
                {tieRate > 5 && (
                  <div className="text-center mt-2 text-[#64748b] text-sm">
                    {t.results.ties}: {tieRate.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0f1424] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-[#00d4ff] tabular-nums">{playerWins.toLocaleString()}</div>
                  <div className="text-xs text-[#64748b] uppercase">{t.results.win}</div>
                </div>
                <div className="bg-[#0f1424] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-[#64748b] tabular-nums">{ties.toLocaleString()}</div>
                  <div className="text-xs text-[#64748b] uppercase">{t.results.ties}</div>
                </div>
                <div className="bg-[#0f1424] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-[#ff4d94] tabular-nums">{computerWins.toLocaleString()}</div>
                  <div className="text-xs text-[#64748b] uppercase">{t.results.loss}</div>
                </div>
              </div>
            </div>
          )}

          {/* Wrong Answer Feedback */}
          {!isCorrect && !isRiver && (
            <div className="bg-[#ff4444]/10 border border-[#ff4444]/30 rounded-xl mt-5 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[#64748b]">{t.results.yourAnswer}: </span>
                  <span className="text-white font-bold">
                    {typeof playerAnswer === 'number'
                      ? `${playerAnswer}%`
                      : playerAnswer === 'player'
                      ? t.game.labels.you
                      : t.game.labels.dealer}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748b]">{t.results.correctAnswer}: </span>
                  <span className="text-[#00ff88] font-bold">
                    {typeof correctAnswer === 'number'
                      ? `${correctAnswer.toFixed(1)}%`
                      : correctAnswer === 'player'
                      ? t.game.labels.you
                      : t.game.labels.dealer}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      <DialogFooter className="px-6 pb-6 pt-0">
        {isCorrect && isTurn ? (
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              onClick={onViewRiver}
              fullWidth
            >
              {t.game.actions.viewRiver}
            </Button>
            <Button
              variant="success"
              onClick={onContinue}
              fullWidth
            >
              {t.game.actions.nextLevel}
            </Button>
          </div>
        ) : isCorrect || isRiver ? (
          <Button
            variant="success"
            onClick={onContinue}
            fullWidth
            size="lg"
          >
            {isRiver ? t.game.actions.nextLevel : t.game.actions.nextRound}
          </Button>
        ) : null}
      </DialogFooter>
    </Dialog>
  );
}
