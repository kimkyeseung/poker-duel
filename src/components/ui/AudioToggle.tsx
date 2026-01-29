'use client';

import { useAudio } from '@/lib/audio';
import { cn } from '@/lib/utils';

interface AudioToggleProps {
  className?: string;
}

export function AudioToggle({ className }: AudioToggleProps) {
  const { isMuted, toggleMute, initAudio } = useAudio();

  const handleClick = () => {
    initAudio();
    toggleMute();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center',
        'bg-[#1a1f35] text-[#64748b]',
        'hover:text-white hover:bg-[#252b45]',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:ring-offset-2 focus:ring-offset-[#0a0e1a]',
        className
      )}
      aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
      title={isMuted ? 'Unmute sound' : 'Mute sound'}
    >
      {isMuted ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      )}
    </button>
  );
}
