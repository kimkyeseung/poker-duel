// 테마 정의
export type ThemeId = 'casino' | 'minimal' | 'dark';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
}

export const THEMES: Record<ThemeId, Theme> = {
  casino: {
    id: 'casino',
    name: '카지노',
    description: '클래식한 카지노 분위기',
    colors: {
      primary: 'from-amber-500 to-orange-600',
      secondary: 'slate-700',
      background: 'from-slate-900 via-slate-800 to-slate-900',
      surface: 'slate-800',
      text: 'white',
      accent: 'amber-500',
    },
  },
  minimal: {
    id: 'minimal',
    name: '미니멀',
    description: '깔끔한 미니멀 디자인',
    colors: {
      primary: 'from-blue-500 to-blue-600',
      secondary: 'gray-600',
      background: 'from-gray-100 via-white to-gray-100',
      surface: 'white',
      text: 'gray-900',
      accent: 'blue-500',
    },
  },
  dark: {
    id: 'dark',
    name: '다크',
    description: '눈이 편한 다크 모드',
    colors: {
      primary: 'from-purple-500 to-pink-600',
      secondary: 'zinc-800',
      background: 'from-zinc-950 via-zinc-900 to-zinc-950',
      surface: 'zinc-900',
      text: 'zinc-100',
      accent: 'purple-500',
    },
  },
};
