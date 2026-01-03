'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { getSettings, saveSettings, GameSettings } from '@/lib/storage';
import { THEMES, ThemeId } from '@/lib/game/themes';
import { soundManager, vibrationManager } from '@/lib/game/sounds';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    vibrationEnabled: true,
    theme: 'casino',
  });

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSoundToggle = () => {
    const newValue = !settings.soundEnabled;
    const newSettings = { ...settings, soundEnabled: newValue };
    setSettings(newSettings);
    saveSettings(newSettings);
    soundManager.setEnabled(newValue);

    if (newValue) {
      soundManager.playClick();
    }
  };

  const handleVibrationToggle = () => {
    const newValue = !settings.vibrationEnabled;
    const newSettings = { ...settings, vibrationEnabled: newValue };
    setSettings(newSettings);
    saveSettings(newSettings);
    vibrationManager.setEnabled(newValue);

    if (newValue) {
      vibrationManager.vibrateShort();
    }
  };

  const handleThemeChange = (themeId: ThemeId) => {
    const newSettings = { ...settings, theme: themeId };
    setSettings(newSettings);
    saveSettings(newSettings);
    soundManager.playClick();
  };

  const handleResetData = () => {
    if (confirm('모든 게임 데이터가 삭제됩니다. 계속하시겠습니까?')) {
      localStorage.removeItem('poker-duel-stats');
      localStorage.removeItem('poker-duel-comments');
      localStorage.removeItem('poker-duel-tutorial-seen');
      alert('데이터가 초기화되었습니다.');
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* 헤더 */}
      <header className="p-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← 메인으로
          </button>
          <div className="text-amber-500 font-bold text-lg">⚙️ 설정</div>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* 사운드 설정 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-white font-semibold mb-4">🔊 사운드 & 진동</h3>
            <div className="space-y-4">
              <ToggleSetting
                label="효과음"
                description="게임 내 효과음 재생"
                enabled={settings.soundEnabled}
                onToggle={handleSoundToggle}
              />
              <ToggleSetting
                label="진동"
                description="모바일 진동 피드백"
                enabled={settings.vibrationEnabled}
                onToggle={handleVibrationToggle}
              />
            </div>
          </div>

          {/* 테마 설정 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-white font-semibold mb-4">🎨 테마</h3>
            <div className="grid gap-3">
              {(Object.values(THEMES) as typeof THEMES[ThemeId][]).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    settings.theme === theme.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{theme.name}</div>
                      <div className="text-sm text-slate-400">{theme.description}</div>
                    </div>
                    {settings.theme === theme.id && (
                      <div className="text-amber-500 text-xl">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              * 테마 변경은 다음 페이지 로드 시 적용됩니다.
            </p>
          </div>

          {/* 데이터 관리 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-white font-semibold mb-4">💾 데이터 관리</h3>
            <Button
              variant="danger"
              size="md"
              onClick={handleResetData}
              className="w-full"
            >
              🗑️ 데이터 초기화
            </Button>
            <p className="text-xs text-slate-500 mt-3 text-center">
              모든 게임 기록, 통계, 도전과제가 삭제됩니다.
            </p>
          </div>

          {/* 정보 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-white font-semibold mb-4">ℹ️ 정보</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex justify-between">
                <span>버전</span>
                <span className="text-white">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>개발</span>
                <span className="text-white">Poker Duel Team</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
    >
      <div className="text-left">
        <div className="text-white font-medium">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
      <div
        className={cn(
          'w-12 h-6 rounded-full transition-colors relative',
          enabled ? 'bg-amber-500' : 'bg-slate-600'
        )}
      >
        <div
          className={cn(
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
            enabled ? 'translate-x-7' : 'translate-x-1'
          )}
        />
      </div>
    </button>
  );
}
