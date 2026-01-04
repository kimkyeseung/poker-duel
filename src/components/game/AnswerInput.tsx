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
    <div className={cn('flex flex-col gap-4', className)} role="group" aria-label="승자 선택">
      <p className="text-center text-white text-lg font-semibold" id="choice-label">
        누가 더 유리할까요?
      </p>
      <div className="flex gap-4 justify-center">
        <Button
          variant="player"
          size="lg"
          onClick={() => onSubmit('player')}
          disabled={disabled}
          className="min-w-32"
          aria-labelledby="choice-label"
        >
          👤 나
        </Button>
        <Button
          variant="computer"
          size="lg"
          onClick={() => onSubmit('computer')}
          disabled={disabled}
          className="min-w-32"
          aria-labelledby="choice-label"
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
    { value: '0-20', label: '0~20%', color: 'from-red-600 to-red-700', focusRing: 'focus:ring-red-500' },
    { value: '20-40', label: '20~40%', color: 'from-orange-600 to-orange-700', focusRing: 'focus:ring-orange-500' },
    { value: '40-60', label: '40~60%', color: 'from-yellow-600 to-yellow-700', focusRing: 'focus:ring-yellow-500' },
    { value: '60-80', label: '60~80%', color: 'from-lime-600 to-lime-700', focusRing: 'focus:ring-lime-500' },
    { value: '80-100', label: '80~100%', color: 'from-emerald-600 to-emerald-700', focusRing: 'focus:ring-emerald-500' },
  ];

  return (
    <div className={cn('flex flex-col gap-4', className)} role="radiogroup" aria-label="나의 승률 선택">
      <p className="text-center text-white text-lg font-semibold" id="range-label">
        나의 승률은?
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {ranges.map(({ value, label, color, focusRing }) => (
          <button
            key={value}
            onClick={() => onSubmit(value)}
            disabled={disabled}
            role="radio"
            aria-checked={false}
            aria-labelledby="range-label"
            className={cn(
              'px-4 py-3 rounded-lg font-bold text-white',
              'bg-gradient-to-r shadow-lg',
              'transition-all duration-200',
              'hover:scale-105 hover:shadow-xl',
              'active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
              color,
              focusRing
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
  const [isInvalid, setIsInvalid] = useState(false);

  const handleSubmit = useCallback(() => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setIsInvalid(false);
      onSubmit(num);
    } else {
      setIsInvalid(true);
      setTimeout(() => setIsInvalid(false), 2000);
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsInvalid(false);
  }, []);

  const isValidNumber = value !== '' && !isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 100;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <p className="text-center text-white text-lg font-semibold" id="number-input-label">
        나의 승률을 입력하세요
      </p>
      <p className="text-center text-slate-400 text-sm">
        허용 오차: ±{tolerance}%
      </p>
      <div className="flex gap-3 justify-center items-center">
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="0 ~ 100"
            aria-label="승률 입력"
            aria-labelledby="number-input-label"
            aria-invalid={isInvalid}
            aria-describedby="tolerance-hint"
            className={cn(
              'w-32 px-4 py-3 text-center text-xl font-bold',
              'bg-slate-700 border-2 rounded-lg',
              'text-white placeholder:text-slate-500',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isInvalid
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500 animate-shake'
                : 'border-slate-600 focus:border-amber-500 focus:ring-amber-500'
            )}
          />
          {isInvalid && (
            <p className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-red-400 whitespace-nowrap">
              0~100 사이 값을 입력하세요
            </p>
          )}
        </div>
        <span className="text-white text-xl font-bold">%</span>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={disabled || !isValidNumber}
          aria-label="답변 제출"
        >
          제출
        </Button>
      </div>
      <span id="tolerance-hint" className="sr-only">허용 오차는 ±{tolerance} 퍼센트입니다</span>
    </div>
  );
}
