'use client';

import { useState, useCallback } from 'react';
import { Difficulty, GameRound, DIFFICULTY_CONFIG } from '@/types';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface AnswerInputProps {
  difficulty: Difficulty;
  currentRound?: GameRound;
  onSubmit: (answer: string | number) => void;
  disabled?: boolean;
  className?: string;
}

export function AnswerInput({
  difficulty,
  currentRound = 'flop',
  onSubmit,
  disabled = false,
  className,
}: AnswerInputProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

  // 프리플랍은 모든 난이도에서 2지선다 (누가 유리한지)
  if (currentRound === 'preflop') {
    return (
      <ChoiceInput onSubmit={onSubmit} disabled={disabled} className={className} />
    );
  }

  switch (config.inputType) {
    case 'choice':
      return (
        <ChoiceInput onSubmit={onSubmit} disabled={disabled} className={className} />
      );
    case 'range':
      return (
        <RangeInput onSubmit={onSubmit} disabled={disabled} className={className} />
      );
    case 'input':
      return (
        <NumberInput
          tolerance={config.tolerance || 0}
          onSubmit={onSubmit}
          disabled={disabled}
          className={className}
        />
      );
  }
}

// 쉬움: 누가 유리한지 선택
function ChoiceInput({
  onSubmit,
  disabled,
  className,
}: {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <p className="text-center text-white text-lg font-semibold">
        누가 더 유리할까요?
      </p>
      <div className="flex gap-4 justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={() => onSubmit('player')}
          disabled={disabled}
          className="min-w-32"
        >
          👤 나
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => onSubmit('computer')}
          disabled={disabled}
          className="min-w-32"
        >
          🤖 컴퓨터
        </Button>
      </div>
    </div>
  );
}

// 보통: 5지선다
function RangeInput({
  onSubmit,
  disabled,
  className,
}: {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const ranges = [
    { value: '0-20', label: '0~20%', color: 'from-red-600 to-red-700' },
    { value: '20-40', label: '20~40%', color: 'from-orange-600 to-orange-700' },
    { value: '40-60', label: '40~60%', color: 'from-yellow-600 to-yellow-700' },
    { value: '60-80', label: '60~80%', color: 'from-lime-600 to-lime-700' },
    { value: '80-100', label: '80~100%', color: 'from-emerald-600 to-emerald-700' },
  ];

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <p className="text-center text-white text-lg font-semibold">
        나의 승률은?
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {ranges.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => onSubmit(value)}
            disabled={disabled}
            className={cn(
              'px-4 py-3 rounded-lg font-bold text-white',
              'bg-gradient-to-r shadow-lg',
              'transform transition-all hover:scale-105 active:scale-95',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
              color
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 어려움/전문가/홀덤의 신: 직접 입력
function NumberInput({
  tolerance,
  onSubmit,
  disabled,
  className,
}: {
  tolerance: number;
  onSubmit: (answer: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(() => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      onSubmit(num);
    }
  }, [value, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <p className="text-center text-white text-lg font-semibold">
        나의 승률을 입력하세요
      </p>
      <p className="text-center text-slate-400 text-sm">
        허용 오차: ±{tolerance}%
      </p>
      <div className="flex gap-3 justify-center items-center">
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="0 ~ 100"
          className={cn(
            'w-32 px-4 py-3 text-center text-xl font-bold',
            'bg-slate-700 border-2 border-slate-600 rounded-lg',
            'text-white placeholder:text-slate-500',
            'focus:outline-none focus:border-amber-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />
        <span className="text-white text-xl font-bold">%</span>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={disabled || !value}
        >
          제출
        </Button>
      </div>
    </div>
  );
}
