'use client';

import { WinRateResult, Difficulty, DIFFICULTY_CONFIG } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { DetailedAnalysis } from './ResultDisplay';
import { useTranslation } from '@/lib/i18n';

interface GameOverDialogProps {
  isOpen: boolean;
  onRetry: () => void;
  onGoHome: () => void;
  difficulty: Difficulty;
  winRateResult: WinRateResult | null;
  message: string;
}

export function GameOverDialog({
  isOpen,
  onRetry,
  onGoHome,
  difficulty,
  winRateResult,
  message,
}: GameOverDialogProps) {
  const { t } = useTranslation();
  const config = DIFFICULTY_CONFIG[difficulty];

  // Calculate difficulty progress
  const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'expert', 'god'];
  const currentIndex = difficulties.indexOf(difficulty);
  const progress = ((currentIndex) / difficulties.length) * 100;

  return (
    <Dialog isOpen={isOpen} onClose={() => {}}>
      <DialogHeader className="text-center">
        {/* Title */}
        <h1 className="text-5xl font-black text-[#ff4444] animate-shake">
          {t.gameOver.title}
        </h1>
        <p className="text-[#a0aec0] mt-2">{message}</p>
      </DialogHeader>

      <DialogContent className="space-y-6">
        {/* Progress reached */}
        <div className="bg-[#1a1f35] rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#64748b] text-xs uppercase">{t.gameOver.reachedLevel}</span>
            <span className="badge badge-outline">{t.difficulty[difficulty]}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill progress-bar-fill-pink"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#64748b]">
            <span>{t.difficulty.easy}</span>
            <span>{t.difficulty.god}</span>
          </div>
        </div>

        {/* Stats summary */}
        {winRateResult && (
          <div className="space-y-4">
            <div className="text-center text-[#64748b] text-xs uppercase tracking-wider">
              {t.gameOver.finalHandAnalysis}
            </div>

            {/* Win Rate Bar */}
            <div className="relative">
              <div className="winrate-bar">
                <div
                  className="winrate-player"
                  style={{ width: `${winRateResult.playerWinRate}%` }}
                >
                  {winRateResult.playerWinRate > 15 && (
                    <span>{winRateResult.playerWinRate.toFixed(0)}%</span>
                  )}
                </div>
                <div
                  className="winrate-computer"
                  style={{ width: `${winRateResult.computerWinRate}%` }}
                >
                  {winRateResult.computerWinRate > 15 && (
                    <span>{winRateResult.computerWinRate.toFixed(0)}%</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-[#00d4ff]">{t.game.labels.you}: {winRateResult.playerWinRate.toFixed(1)}%</span>
                <span className="text-[#ff4d94]">{t.game.labels.dealer}: {winRateResult.computerWinRate.toFixed(1)}%</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#0f1424] rounded-lg p-2">
                <div className="text-lg font-bold text-[#00d4ff] tabular-nums">
                  {winRateResult.playerWins.toLocaleString()}
                </div>
                <div className="text-xs text-[#64748b]">{t.results.win}</div>
              </div>
              <div className="bg-[#0f1424] rounded-lg p-2">
                <div className="text-lg font-bold text-[#64748b] tabular-nums">
                  {winRateResult.ties.toLocaleString()}
                </div>
                <div className="text-xs text-[#64748b]">{t.results.ties}</div>
              </div>
              <div className="bg-[#0f1424] rounded-lg p-2">
                <div className="text-lg font-bold text-[#ff4d94] tabular-nums">
                  {winRateResult.computerWins.toLocaleString()}
                </div>
                <div className="text-xs text-[#64748b]">{t.results.loss}</div>
              </div>
            </div>
          </div>
        )}

        {/* Encouragement */}
        <p className="text-center text-[#64748b] text-sm">
          {t.gameOver.encouragement}
        </p>
      </DialogContent>

      <DialogFooter className="flex-col sm:flex-row gap-3">
        <Button variant="primary" onClick={onRetry} size="lg" fullWidth>
          {t.gameOver.nextDuel}
        </Button>
        <Button variant="secondary" onClick={onGoHome} size="md" fullWidth>
          {t.common.exit}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
