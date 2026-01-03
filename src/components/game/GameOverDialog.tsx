'use client';

import { WinRateResult, Difficulty, DIFFICULTY_CONFIG } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { DetailedAnalysis } from './ResultDisplay';

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
  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <Dialog isOpen={isOpen} onClose={() => {}}>
      <DialogHeader>
        <DialogTitle className="text-center">
          <span className="text-red-400">💔 게임 오버</span>
        </DialogTitle>
      </DialogHeader>

      <DialogContent className="space-y-4">
        {/* 메시지 */}
        <div className="text-center">
          <p className="text-slate-300">{message}</p>
          <p className="text-sm text-slate-500 mt-2">
            도달 난이도: <span className="text-amber-400 font-semibold">{config.nameKo}</span>
          </p>
        </div>

        {/* 상세 분석 */}
        {winRateResult && (
          <DetailedAnalysis winRateResult={winRateResult} />
        )}
      </DialogContent>

      <DialogFooter>
        <Button variant="ghost" onClick={onGoHome}>
          메인으로
        </Button>
        <Button variant="primary" onClick={onRetry}>
          다시 도전
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
