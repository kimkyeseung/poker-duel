'use client';

import { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TimerProps {
  seconds: number;
  maxSeconds: number;
  isRunning: boolean;
  onTick: () => void;
  onTimeout: () => void;
  className?: string;
}

export function Timer({
  seconds,
  maxSeconds,
  isRunning,
  onTick,
  onTimeout,
  className,
}: TimerProps) {
  useEffect(() => {
    if (!isRunning) return;

    if (seconds <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      onTick();
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, seconds, onTick, onTimeout]);

  const percentage = (seconds / maxSeconds) * 100;
  const isWarning = seconds <= 3;
  const isCritical = seconds <= 1;

  return (
    <div className={cn('relative', className)} role="timer" aria-live="polite" aria-atomic="true">
      {/* 원형 타이머 */}
      <div className="relative w-20 h-20">
        <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
          {/* 배경 원 */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-700"
          />
          {/* 진행 원 */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 36}`}
            strokeDashoffset={`${2 * Math.PI * 36 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-1000 ease-linear',
              isCritical
                ? 'text-red-500 animate-pulse'
                : isWarning
                ? 'text-amber-500'
                : 'text-emerald-500'
            )}
          />
        </svg>

        {/* 숫자 */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center text-2xl font-bold tabular-nums',
            isCritical
              ? 'text-red-500 animate-pulse'
              : isWarning
              ? 'text-amber-500'
              : 'text-white'
          )}
          aria-label={`남은 시간 ${seconds}초`}
        >
          {seconds}
        </div>
      </div>

      {/* 위험 경고 */}
      {isWarning && isRunning && (
        <div
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-amber-500 font-semibold animate-pulse"
          role="alert"
        >
          서두르세요!
        </div>
      )}
    </div>
  );
}

// 바 형태 타이머
export function TimerBar({
  seconds,
  maxSeconds,
  isRunning,
  onTick,
  onTimeout,
  className,
}: TimerProps) {
  useEffect(() => {
    if (!isRunning) return;

    if (seconds <= 0) {
      onTimeout();
      return;
    }

    // 0.1초 단위로 업데이트
    const timer = setInterval(() => {
      onTick();
    }, 100);

    return () => clearInterval(timer);
  }, [isRunning, seconds, onTick, onTimeout]);

  const percentage = (seconds / maxSeconds) * 100;
  const isWarning = seconds <= 3;
  const isCritical = seconds <= 1;
  const displaySeconds = Math.ceil(seconds);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-slate-400">남은 시간</span>
        <span
          className={cn(
            'text-lg font-bold',
            isCritical
              ? 'text-red-500 animate-pulse'
              : isWarning
              ? 'text-amber-500'
              : 'text-white'
          )}
        >
          {displaySeconds}초
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-100',
            isCritical
              ? 'bg-red-500 animate-pulse'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
