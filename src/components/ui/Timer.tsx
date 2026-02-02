'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TimerProps {
  seconds: number;
  maxSeconds: number;
  isRunning: boolean;
  onTick: () => void;
  onTimeout: () => void;
  className?: string;
  compact?: boolean;
}

export function Timer({
  seconds,
  maxSeconds,
  isRunning,
  onTick,
  onTimeout,
  className,
  compact = false,
}: TimerProps) {
  useEffect(() => {
    if (!isRunning) return;

    if (seconds <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      onTick();
    }, 100);

    return () => clearInterval(timer);
  }, [isRunning, seconds, onTick, onTimeout]);

  const percentage = (seconds / maxSeconds) * 100;
  const isWarning = seconds <= 5;
  const isCritical = seconds <= 3;

  // SVG circle properties
  const radius = compact ? 16 : 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);
  const viewBox = compact ? '0 0 40 40' : '0 0 100 100';
  const center = compact ? 20 : 50;
  const strokeWidth = compact ? 3 : 6;

  // Compact mode - inline badge style
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
          isCritical
            ? 'bg-[#ff4444]/20'
            : isWarning
            ? 'bg-[#ffb800]/20'
            : 'bg-[#1a1f35]',
          className
        )}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="relative w-8 h-8">
          <svg className="w-full h-full -rotate-90" viewBox={viewBox} aria-hidden="true">
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#1a1f35"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn(
                isCritical
                  ? 'stroke-[#ff4444]'
                  : isWarning
                  ? 'stroke-[#ffb800]'
                  : 'stroke-[#00d4ff]'
              )}
            />
          </svg>
        </div>
        <span
          className={cn(
            'text-lg font-bold tabular-nums',
            isCritical
              ? 'text-[#ff4444] animate-pulse'
              : isWarning
              ? 'text-[#ffb800]'
              : 'text-white'
          )}
          aria-label={`${seconds} seconds remaining`}
        >
          {seconds}s
        </span>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} role="timer" aria-live="polite" aria-atomic="true">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox={viewBox} aria-hidden="true">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1a1f35"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              'timer-ring origin-center',
              isCritical
                ? 'stroke-[#ff4444] timer-warning'
                : isWarning
                ? 'stroke-[#ffb800]'
                : 'stroke-[#00d4ff]'
            )}
            style={{
              filter: isCritical
                ? 'drop-shadow(0 0 8px rgba(255, 68, 68, 0.6))'
                : isWarning
                ? 'drop-shadow(0 0 8px rgba(255, 184, 0, 0.4))'
                : 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.4))'
            }}
          />
        </svg>

        {/* Timer number */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center text-3xl font-black tabular-nums',
            isCritical
              ? 'text-[#ff4444] animate-pulse'
              : isWarning
              ? 'text-[#ffb800]'
              : 'text-white'
          )}
          aria-label={`${seconds} seconds remaining`}
        >
          {seconds}
          <span className="text-sm font-normal text-[#64748b] ml-0.5">s</span>
        </div>
      </div>
    </div>
  );
}

// Bar style timer
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

    const timer = setInterval(() => {
      onTick();
    }, 100);

    return () => clearInterval(timer);
  }, [isRunning, seconds, onTick, onTimeout]);

  const percentage = (seconds / maxSeconds) * 100;
  const isWarning = seconds <= 5;
  const isCritical = seconds <= 3;
  const displaySeconds = Math.ceil(seconds);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-[#64748b] uppercase tracking-wider">Time Remaining</span>
        <span
          className={cn(
            'text-xl font-bold tabular-nums',
            isCritical
              ? 'text-[#ff4444] animate-pulse'
              : isWarning
              ? 'text-[#ffb800]'
              : 'text-[#00d4ff]'
          )}
        >
          {displaySeconds}s
        </span>
      </div>
      <div className="h-2 bg-[#1a1f35] rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-100',
            isCritical
              ? 'bg-gradient-to-r from-[#ff4444] to-[#cc0000] animate-pulse shadow-[0_0_10px_rgba(255,68,68,0.5)]'
              : isWarning
              ? 'bg-gradient-to-r from-[#ffd700] to-[#ffb800] shadow-[0_0_10px_rgba(255,215,0,0.3)]'
              : 'bg-gradient-to-r from-[#00d4ff] to-[#0066ff] shadow-[0_0_10px_rgba(0,212,255,0.3)]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
