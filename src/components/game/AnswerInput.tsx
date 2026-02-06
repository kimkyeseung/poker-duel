'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Difficulty, GameRound, DIFFICULTY_CONFIG } from '@/types';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

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

  // Preflop always uses choice input
  if (currentRound === 'preflop') {
    return (
      <ChoiceInput onSubmit={onSubmit} disabled={disabled} className={className} isPreflop />
    );
  }

  switch (config.inputType) {
    case 'choice':
      return (
        <ChoiceInput onSubmit={onSubmit} disabled={disabled} className={className} isPreflop={false} />
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

// Choice input (Easy mode / Preflop)
function ChoiceInput({
  onSubmit,
  disabled,
  className,
  isPreflop = true,
}: {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  className?: string;
  isPreflop?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={cn('game-card p-3 sm:p-6 lg:!bg-transparent lg:!border-none lg:!shadow-none lg:!p-0', className)} role="group" aria-label="Select winner">
      {/* Symbol Image - Desktop only */}
      <div className="hidden lg:flex justify-center mb-4">
        <div className="relative w-48 h-48">
          <Image
            src="/symbol.png"
            alt="Mascot"
            fill
            className="object-contain drop-shadow-[0_0_30px_rgba(0,212,255,0.5)]"
          />
        </div>
      </div>

      <p className="text-center text-white text-sm sm:text-lg lg:text-base font-semibold mb-2 sm:mb-4 lg:mb-4">
        {isPreflop ? t.game.questions.whoHasBetterHand : t.game.questions.whoHasHigherWinRate}
      </p>
      {/* Mobile/Tablet: Horizontal, Desktop: Vertical (dealer first on desktop) */}
      <div className="flex flex-row lg:flex-col gap-2 sm:gap-4 lg:gap-3 justify-center">
        <Button
          variant="computer"
          size="lg"
          onClick={() => onSubmit('computer')}
          disabled={disabled}
          className="min-w-24 sm:min-w-36 lg:w-full order-2 lg:order-1"
        >
          {t.game.labels.dealer}
        </Button>
        <Button
          variant="player"
          size="lg"
          onClick={() => onSubmit('player')}
          disabled={disabled}
          className="min-w-24 sm:min-w-36 lg:w-full order-1 lg:order-2"
        >
          {t.game.labels.you}
        </Button>
      </div>
    </div>
  );
}

// Range input (Normal mode)
function RangeInput({
  onSubmit,
  disabled,
  className,
}: {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const ranges = [
    { value: '0-20', label: '0-20%', gradient: 'from-[#ff4444] to-[#cc0000]' },
    { value: '20-40', label: '20-40%', gradient: 'from-[#ff4d94] to-[#ff0080]' },
    { value: '40-60', label: '40-60%', gradient: 'from-[#ffd700] to-[#ffb800]' },
    { value: '60-80', label: '60-80%', gradient: 'from-[#00d4ff] to-[#0066ff]' },
    { value: '80-100', label: '80-100%', gradient: 'from-[#00ff88] to-[#00cc66]' },
  ];

  return (
    <div className={cn('game-card p-3 sm:p-6 lg:!bg-transparent lg:!border-none lg:!shadow-none lg:!p-0', className)} role="radiogroup" aria-label="Select win rate range">
      {/* Symbol Image - Desktop only (smaller for 5-choice) */}
      <div className="hidden lg:flex justify-center mb-2">
        <div className="relative w-20 h-20">
          <Image
            src="/symbol.png"
            alt="Mascot"
            fill
            className="object-contain drop-shadow-[0_0_20px_rgba(0,212,255,0.4)]"
          />
        </div>
      </div>

      <p className="text-center text-white text-sm sm:text-lg lg:text-base font-semibold mb-2 sm:mb-4 lg:mb-3">
        {t.game.questions.whatIsWinProbability}
      </p>
      {/* Mobile/Tablet: Horizontal grid, Desktop: Vertical stack */}
      <div className="grid grid-cols-5 lg:grid-cols-1 gap-1 sm:gap-2 lg:gap-2">
        {ranges.map(({ value, label, gradient }) => (
          <button
            key={value}
            onClick={() => onSubmit(value)}
            disabled={disabled}
            role="radio"
            aria-checked={false}
            className={cn(
              'py-2 sm:py-3 lg:py-3 px-1 sm:px-2 lg:px-4 rounded-lg sm:rounded-xl font-bold text-white',
              'text-[10px] sm:text-sm lg:text-base',
              'bg-gradient-to-b lg:bg-gradient-to-r',
              'transition-all duration-200',
              'hover:scale-105 lg:hover:scale-[1.02] hover:-translate-y-1 lg:hover:translate-y-0 lg:hover:translate-x-1',
              'active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0a0e1a]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:translate-x-0',
              gradient
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Number input (Hard/Expert/God mode)
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
  const { t } = useTranslation();
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
    <div className={cn('game-card p-3 sm:p-6 lg:!bg-transparent lg:!border-none lg:!shadow-none lg:!p-0', className)}>
      {/* Symbol Image - Desktop only */}
      <div className="hidden lg:flex justify-center mb-4">
        <div className="relative w-48 h-48">
          <Image
            src="/symbol.png"
            alt="Mascot"
            fill
            className="object-contain drop-shadow-[0_0_30px_rgba(0,212,255,0.5)]"
          />
        </div>
      </div>

      <p className="text-center text-white text-sm sm:text-lg lg:text-base font-semibold mb-1 sm:mb-2">
        {t.game.questions.enterWinRate}
      </p>
      <p className="text-center text-[#64748b] text-xs sm:text-sm mb-2 sm:mb-4 lg:mb-3">
        {t.game.tolerance.replace('{tolerance}', String(tolerance))}
      </p>

      <div className="flex flex-col items-center gap-2 sm:gap-4 lg:gap-3">
        {/* Input area */}
        <div className="flex items-center gap-3 w-full justify-center">
          <div className="relative w-full max-w-[180px] lg:max-w-none">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="0-100"
              aria-label="Win probability"
              aria-invalid={isInvalid}
              className={cn(
                'w-full px-3 sm:px-4 py-3 sm:py-4 lg:py-3 text-center text-xl sm:text-2xl lg:text-xl font-bold',
                'bg-[#1a1f35] border-2 rounded-xl',
                'text-white placeholder:text-[#64748b]',
                'transition-all duration-200',
                'focus:outline-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                isInvalid
                  ? 'border-[#ff4444] focus:border-[#ff4444] animate-shake'
                  : 'border-[#1a1f35] focus:border-[#00d4ff] focus:shadow-[0_0_20px_rgba(0,212,255,0.2)]'
              )}
            />
            <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[#64748b] text-lg sm:text-xl font-bold">
              %
            </span>
          </div>
        </div>

        {/* Error message */}
        {isInvalid && (
          <p className="text-[#ff4444] text-xs sm:text-sm">
            {t.game.validation.invalidRange}
          </p>
        )}

        {/* Submit button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={disabled || !isValidNumber}
          className="w-full"
        >
          {t.game.actions.submit}
        </Button>
      </div>
    </div>
  );
}
