'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, LanguageSelector } from '@/components/ui';
import { getSettings, saveSettings, GameSettings } from '@/lib/storage';
import { THEMES, ThemeId } from '@/lib/game/themes';
import { soundManager, vibrationManager } from '@/lib/game/sounds';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
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
    if (confirm(t.settings.resetConfirm)) {
      localStorage.removeItem('holdamnit-stats');
      localStorage.removeItem('holdamnit-comments');
      localStorage.removeItem('holdamnit-tutorial-seen');
      alert('Data has been reset.');
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      {/* 헤더 */}
      <header className="p-4 border-b border-white/5 glass">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-[#64748b] hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{t.common.back}</span>
          </button>
          <div className="text-[#00d4ff] font-bold text-lg">{t.settings.title}</div>
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* 사운드 설정 */}
          <div className="game-card p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] text-sm">S</span>
              {t.settings.soundVibration}
            </h3>
            <div className="space-y-4">
              <ToggleSetting
                label={t.settings.soundEffects}
                description="Play in-game sounds"
                enabled={settings.soundEnabled}
                onToggle={handleSoundToggle}
              />
              <ToggleSetting
                label={t.settings.vibration}
                description="Mobile haptic feedback"
                enabled={settings.vibrationEnabled}
                onToggle={handleVibrationToggle}
              />
            </div>
          </div>

          {/* 테마 설정 */}
          <div className="game-card p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#ff4d94]/20 flex items-center justify-center text-[#ff4d94] text-sm">T</span>
              {t.settings.theme}
            </h3>
            <div className="grid gap-3">
              {(Object.values(THEMES) as typeof THEMES[ThemeId][]).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    settings.theme === theme.id
                      ? 'border-[#00d4ff] bg-[#00d4ff]/10'
                      : 'border-white/10 bg-[#1a1f35]/50 hover:border-white/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{theme.name}</div>
                      <div className="text-sm text-[#64748b]">{theme.description}</div>
                    </div>
                    {settings.theme === theme.id && (
                      <div className="text-[#00d4ff] text-xl font-bold">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-[#64748b] mt-3">
              * Theme changes will apply on next page load.
            </p>
          </div>

          {/* 데이터 관리 */}
          <div className="game-card p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#ff4444]/20 flex items-center justify-center text-[#ff4444] text-sm">D</span>
              {t.settings.dataManagement}
            </h3>
            <Button
              variant="danger"
              size="md"
              onClick={handleResetData}
              fullWidth
            >
              {t.settings.resetData}
            </Button>
            <p className="text-xs text-[#64748b] mt-3 text-center">
              All game records, stats, and achievements will be deleted.
            </p>
          </div>

          {/* 정보 */}
          <div className="game-card p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#ffd700]/20 flex items-center justify-center text-[#ffd700] text-sm">i</span>
              Information
            </h3>
            <div className="space-y-2 text-sm text-[#64748b]">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="text-white">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Developer</span>
                <span className="text-white">Hol'Damn It! Team</span>
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
      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
    >
      <div className="text-left">
        <div className="text-white font-medium">{label}</div>
        <div className="text-xs text-[#64748b]">{description}</div>
      </div>
      <div
        className={cn(
          'w-12 h-6 rounded-full transition-colors relative',
          enabled ? 'bg-[#00d4ff]' : 'bg-[#1a1f35]'
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
