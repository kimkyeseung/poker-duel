'use client';

import { WinRateResult, AnswerResult } from '@/types';
import { cn } from '@/lib/utils';

interface ResultDisplayProps {
  winRateResult: WinRateResult;
  answerResult: AnswerResult;
  className?: string;
}

export function ResultDisplay({
  winRateResult,
  answerResult,
  className,
}: ResultDisplayProps) {
  const { playerWinRate, computerWinRate, tieRate, totalCombinations, playerWins, computerWins, ties } = winRateResult;
  const { isCorrect, playerAnswer, correctAnswer } = answerResult;

  return (
    <div className={cn('bg-slate-800/90 rounded-2xl p-6 border border-slate-700', className)}>
      {/* 정답/오답 표시 */}
      <div className="text-center mb-6">
        <div
          className={cn(
            'inline-flex items-center gap-2 px-6 py-3 rounded-full text-xl font-bold',
            isCorrect
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          )}
        >
          {isCorrect ? '✓ 정답!' : '✗ 오답'}
        </div>
      </div>

      {/* 승률 비교 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400">
            {playerWinRate.toFixed(1)}%
          </div>
          <div className="text-sm text-slate-400 mt-1">👤 나의 승률</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-400">
            {tieRate.toFixed(1)}%
          </div>
          <div className="text-sm text-slate-500 mt-1">무승부</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-400">
            {computerWinRate.toFixed(1)}%
          </div>
          <div className="text-sm text-slate-400 mt-1">🤖 컴퓨터 승률</div>
        </div>
      </div>

      {/* 승률 바 */}
      <div className="h-4 bg-slate-700 rounded-full overflow-hidden mb-4">
        <div className="h-full flex">
          <div
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${playerWinRate}%` }}
          />
          <div
            className="bg-slate-500 transition-all duration-500"
            style={{ width: `${tieRate}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${computerWinRate}%` }}
          />
        </div>
      </div>

      {/* 상세 통계 */}
      <div className="bg-slate-900/50 rounded-lg p-4">
        <div className="text-sm text-slate-400 mb-2">상세 통계</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">총 경우의 수:</span>
            <span className="text-white font-mono">{totalCombinations.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">나의 승리:</span>
            <span className="text-blue-400 font-mono">{playerWins.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">컴퓨터 승리:</span>
            <span className="text-red-400 font-mono">{computerWins.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">무승부:</span>
            <span className="text-slate-400 font-mono">{ties.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 내 답변 vs 정답 */}
      {!isCorrect && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-slate-400 text-sm">내 답변: </span>
              <span className="text-white font-bold">
                {typeof playerAnswer === 'number'
                  ? `${playerAnswer}%`
                  : playerAnswer === 'player'
                  ? '👤 나'
                  : playerAnswer === 'computer'
                  ? '🤖 컴퓨터'
                  : playerAnswer}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-sm">정답: </span>
              <span className="text-emerald-400 font-bold">{correctAnswer.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 게임오버 시 보여줄 상세 분석
export function DetailedAnalysis({
  winRateResult,
  className,
}: {
  winRateResult: WinRateResult;
  className?: string;
}) {
  const { playerWinRate, computerWinRate, playerWins, computerWins, ties, totalCombinations } = winRateResult;

  // 더 낮은 확률 계산 (승/패 중)
  const lowerProbability = Math.min(playerWinRate, computerWinRate);
  const isPlayerLower = playerWinRate < computerWinRate;

  return (
    <div className={cn('bg-slate-800/90 rounded-2xl p-6 border border-slate-700', className)}>
      <h3 className="text-lg font-bold text-white mb-4">상세 분석</h3>

      <div className="space-y-4">
        {/* 확률 요약 */}
        <div className="bg-slate-900/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">확률 요약</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {lowerProbability.toFixed(2)}%
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {isPlayerLower ? '나의 승리 확률 (열세)' : '컴퓨터 승리 확률 (열세)'}
            </div>
          </div>
        </div>

        {/* 모든 경우의 수 */}
        <div className="bg-slate-900/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-3">경우의 수 분석</div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span className="text-slate-300 flex-1">나의 승리</span>
              <span className="text-blue-400 font-mono">
                {playerWins.toLocaleString()} ({playerWinRate.toFixed(2)}%)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-slate-300 flex-1">컴퓨터 승리</span>
              <span className="text-red-400 font-mono">
                {computerWins.toLocaleString()} ({computerWinRate.toFixed(2)}%)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-slate-500 rounded" />
              <span className="text-slate-300 flex-1">무승부</span>
              <span className="text-slate-400 font-mono">
                {ties.toLocaleString()} ({((ties / totalCombinations) * 100).toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
