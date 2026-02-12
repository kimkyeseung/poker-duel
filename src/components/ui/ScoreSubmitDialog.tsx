'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { submitScore, isSupabaseConfigured } from '@/lib/supabase';
import { formatChips } from '@/lib/game/chips';
import { useTranslation } from '@/lib/i18n';
import { Difficulty } from '@/types';

interface ScoreSubmitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chips: number;
  difficultyReached: Difficulty;
  onSubmitSuccess?: () => void;
}

export function ScoreSubmitDialog({
  isOpen,
  onClose,
  chips,
  difficultyReached,
  onSubmitSuccess,
}: ScoreSubmitDialogProps) {
  const { t } = useTranslation();
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!playerName.trim()) {
      setError(t.leaderboard?.nameRequired || 'Name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await submitScore(
      playerName,
      chips,
      difficultyReached
    );

    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      onSubmitSuccess?.();
    } else {
      setError(result.error || 'Failed to submit');
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="game-card p-6 max-w-md w-full text-center">
          <p className="text-[#64748b]">
            {t.leaderboard?.notConfigured || 'Leaderboard not available'}
          </p>
          <Button onClick={onClose} className="mt-4">
            {t.common.close}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="game-card p-6 max-w-md w-full animate-bounce-in">
        {submitted ? (
          // Success state
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {t.leaderboard?.submitted || 'Score Submitted!'}
            </h3>
            <p className="text-[#64748b] mb-4">
              {t.leaderboard?.checkLeaderboard || 'Check the leaderboard to see your rank!'}
            </p>
            <Button onClick={onClose} variant="primary" size="lg">
              {t.common.close}
            </Button>
          </div>
        ) : (
          // Submit form
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">🏆</div>
              <h3 className="text-xl font-bold text-white">
                {t.leaderboard?.submitScore || 'Submit Your Score'}
              </h3>
            </div>

            {/* Score display */}
            <div className="bg-[#1a1f35] rounded-xl p-4 mb-6 text-center">
              <div className="text-3xl font-bold text-[#ffd700] mb-1">
                {formatChips(chips)} 🪙
              </div>
              <div className="text-sm text-[#64748b]">
                {t.difficulty?.[difficultyReached] || difficultyReached}
              </div>
            </div>

            {/* Name input */}
            <div className="mb-4">
              <label className="block text-sm text-[#94a3b8] mb-2">
                {t.leaderboard?.yourName || 'Your Name'}
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                placeholder={t.leaderboard?.namePlaceholder || 'Enter your name'}
                className={cn(
                  'w-full px-4 py-3 rounded-xl',
                  'bg-[#0f1424] border-2 border-[#1a1f35]',
                  'text-white placeholder:text-[#64748b]',
                  'focus:outline-none focus:border-[#00d4ff]',
                  'transition-colors'
                )}
                disabled={isSubmitting}
              />
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="secondary"
                size="lg"
                className="flex-1"
                disabled={isSubmitting}
              >
                {t.common.cancel}
              </Button>
              <Button
                onClick={handleSubmit}
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={isSubmitting || !playerName.trim()}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>{t.common.loading}</span>
                  </div>
                ) : (
                  t.leaderboard?.submit || 'Submit'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
