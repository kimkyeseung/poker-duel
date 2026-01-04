'use client';

import { cn } from '@/lib/utils';
import { typography, colors } from '@/lib/design-tokens';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

// 페이지 제목 (H1)
export function PageTitle({ children, className }: TypographyProps) {
  return (
    <h1 className={cn(typography.heading.xl, colors.text.primary, className)}>
      {children}
    </h1>
  );
}

// 섹션 제목 (H2)
export function SectionTitle({ children, className }: TypographyProps) {
  return (
    <h2 className={cn(typography.heading.md, colors.text.primary, className)}>
      {children}
    </h2>
  );
}

// 카드/컴포넌트 제목 (H3)
export function CardTitle({ children, className }: TypographyProps) {
  return (
    <h3 className={cn(typography.heading.sm, colors.text.primary, className)}>
      {children}
    </h3>
  );
}

// 소제목 (H4)
export function SubTitle({ children, className }: TypographyProps) {
  return (
    <h4 className={cn(typography.heading.xs, colors.text.secondary, className)}>
      {children}
    </h4>
  );
}

// 본문 텍스트
export function Text({
  children,
  className,
  size = 'md',
  muted = false,
}: TypographyProps & { size?: 'lg' | 'md' | 'sm' | 'xs'; muted?: boolean }) {
  return (
    <p className={cn(
      typography.body[size],
      muted ? colors.text.muted : colors.text.secondary,
      className
    )}>
      {children}
    </p>
  );
}

// 라벨 텍스트
export function Label({ children, className }: TypographyProps) {
  return (
    <span className={cn(typography.special.label, colors.text.muted, className)}>
      {children}
    </span>
  );
}

// 숫자/통계 텍스트
export function Stat({
  children,
  className,
  size = 'lg',
  color = 'primary',
}: TypographyProps & {
  size?: 'xl' | 'lg' | 'md' | 'sm';
  color?: 'primary' | 'success' | 'error' | 'warning' | 'player' | 'computer' | 'muted';
}) {
  const sizeClasses = {
    xl: 'text-4xl',
    lg: 'text-3xl',
    md: 'text-2xl',
    sm: 'text-xl',
  };

  const colorClasses = {
    primary: colors.text.primary,
    success: colors.success.text,
    error: colors.error.text,
    warning: colors.warning.text,
    player: colors.player.text,
    computer: colors.computer.text,
    muted: colors.text.muted,
  };

  return (
    <span className={cn(
      sizeClasses[size],
      'font-bold',
      typography.special.tabular,
      colorClasses[color],
      className
    )}>
      {children}
    </span>
  );
}

// 강조 텍스트
export function Highlight({
  children,
  className,
  color = 'primary',
}: TypographyProps & { color?: 'primary' | 'success' | 'error' | 'player' | 'computer' }) {
  const colorClasses = {
    primary: 'text-amber-400',
    success: 'text-emerald-400',
    error: 'text-red-400',
    player: 'text-blue-400',
    computer: 'text-red-400',
  };

  return (
    <span className={cn('font-semibold', colorClasses[color], className)}>
      {children}
    </span>
  );
}

// 코드/모노스페이스 텍스트
export function Mono({ children, className }: TypographyProps) {
  return (
    <span className={cn(typography.special.mono, colors.text.primary, className)}>
      {children}
    </span>
  );
}

// 비주얼하게 숨겨진 텍스트 (접근성용)
export function VisuallyHidden({ children }: TypographyProps) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}
