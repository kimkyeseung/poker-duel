'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg';

interface ProfileAvatarProps {
  src?: string;
  alt: string;
  fallback?: string;  // 이미지 로드 실패 시 표시할 텍스트
  size?: AvatarSize;
  isActive?: boolean;
  isDefeated?: boolean;
  isPlayer?: boolean;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
};

const sizePixels: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function ProfileAvatar({
  src,
  alt,
  fallback = '?',
  size = 'md',
  isActive = false,
  isDefeated = false,
  isPlayer = false,
  className,
}: ProfileAvatarProps) {
  const hasImage = src && src.length > 0;

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex items-center justify-center font-bold',
        'border-2 transition-all duration-300',
        sizeClasses[size],
        // 기본 배경
        isPlayer
          ? 'bg-gradient-to-br from-[#00d4ff] to-[#0066ff]'
          : 'bg-gradient-to-br from-[#ff4d94] to-[#ff0080]',
        // 테두리 색상
        isActive && !isDefeated
          ? isPlayer
            ? 'border-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.5)]'
            : 'border-[#ff4d94] shadow-[0_0_15px_rgba(255,77,148,0.5)]'
          : 'border-white/20',
        // 패배 시 스타일
        isDefeated && 'grayscale opacity-50',
        className
      )}
    >
      {hasImage ? (
        <Image
          src={src}
          alt={alt}
          width={sizePixels[size]}
          height={sizePixels[size]}
          className={cn(
            'object-cover w-full h-full',
            isDefeated && 'grayscale'
          )}
          onError={(e) => {
            // 이미지 로드 실패 시 숨김
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span className="text-white">{fallback}</span>
      )}

      {/* 패배 마크 */}
      {isDefeated && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <svg
            className="w-1/2 h-1/2 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
