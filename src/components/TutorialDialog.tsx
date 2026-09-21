'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { setTutorialSeen } from '@/lib/storage';
import { useTranslation, TranslationKeys } from '@/lib/i18n';
import { DIFFICULTY_CONFIG, PREFLOP_TIME_LIMIT } from '@/types';

interface TutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIFFICULTY_STYLES: { key: 'easy' | 'normal' | 'hard' | 'expert' | 'king' | 'god'; badge: string }[] = [
  { key: 'easy',   badge: 'bg-[#00ff88]/20 text-[#00ff88]' },
  { key: 'normal', badge: 'bg-[#00d4ff]/20 text-[#00d4ff]' },
  { key: 'hard',   badge: 'bg-[#ffd700]/20 text-[#ffd700]' },
  { key: 'expert', badge: 'bg-[#ff4d94]/20 text-[#ff4d94]' },
  { key: 'king',   badge: 'bg-[#ff8c00]/20 text-[#ff8c00]' },
  { key: 'god',    badge: 'bg-[#ff4444]/20 text-[#ff4444]' },
];

const ROUND_CARD_COUNTS: { key: 'preflop' | 'flop' | 'turn' | 'river'; count: number; color: string }[] = [
  { key: 'preflop', count: 0, color: 'text-[#00ff88]' },
  { key: 'flop',    count: 3, color: 'text-[#00d4ff]' },
  { key: 'turn',    count: 4, color: 'text-[#ffd700]' },
  { key: 'river',   count: 5, color: 'text-[#ff4d94]' },
];

/**
 * 튜토리얼 슬라이드.
 *
 * 예전에는 문구가 전부 영어로 하드코딩돼 있었고, 내용도 실제 게임과 어긋나 있었다
 * (제한시간 5초/10초, 난이도 5개, 보통=5지선다 등). 난이도 설명은 levelInfo,
 * 제한시간은 PREFLOP_TIME_LIMIT / DIFFICULTY_CONFIG 의 실제 값을 쓴다.
 */
function buildSlides(t: TranslationKeys) {
  return [
    {
      title: t.tutorial.welcome.title,
      icon: 'P',
      iconColor: 'from-[#ff4d94] to-[#ff0080]',
      content: (
        <div className="space-y-3 text-white/80">
          <p>{t.tutorial.welcome.description}</p>
        </div>
      ),
    },
    {
      title: t.tutorial.gameFlow.title,
      icon: 'G',
      iconColor: 'from-[#00d4ff] to-[#0066ff]',
      content: (
        <div className="space-y-3 text-white/80">
          <div className="bg-[#1a1f35] rounded-xl p-4">
            <div className="font-bold text-white mb-2">{t.tutorial.roundsTitle}</div>
            <ul className="space-y-1 text-sm">
              {ROUND_CARD_COUNTS.map(({ key, count, color }) => (
                <li key={key}>
                  • <span className={color}>{t.game.rounds[key]}</span>
                  {': '}
                  {t.tutorial.communityCards.replace('{count}', String(count))}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm">{t.tutorial.answerAllRounds}</p>
        </div>
      ),
    },
    {
      title: t.tutorial.difficulties.title,
      icon: 'D',
      iconColor: 'from-[#ffd700] to-[#ffb800]',
      content: (
        <div className="space-y-3 text-white/80">
          <ul className="space-y-2 text-sm">
            {DIFFICULTY_STYLES.map(({ key, badge }) => (
              <li key={key} className="flex items-center gap-2">
                <span className={`${badge} px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap`}>
                  {t.difficulty[key]}
                </span>
                {t.levelInfo[key]}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: t.tutorial.timeLimits.title,
      icon: 'T',
      iconColor: 'from-[#ff4444] to-[#cc0000]',
      content: (
        <div className="space-y-3 text-white/80">
          <div className="bg-[#1a1f35] rounded-xl p-4">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>{t.game.rounds.preflop}</span>
                <span className="text-[#00d4ff] font-bold">
                  {t.tutorial.secondsValue.replace('{count}', String(PREFLOP_TIME_LIMIT))}
                </span>
              </li>
              <li className="flex justify-between">
                <span>{t.tutorial.timeOthers}</span>
                <span className="text-[#00d4ff] font-bold">
                  {t.tutorial.secondsValue.replace('{count}', String(DIFFICULTY_CONFIG.easy.timeLimit))}
                </span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-[#ff4444]">{t.tutorial.timeWarning}</p>
          <p className="text-sm">{t.tutorial.practiceNote}</p>
        </div>
      ),
    },
    {
      title: t.tutorial.ready.title,
      icon: 'R',
      iconColor: 'from-[#00ff88] to-[#00cc66]',
      content: (
        <div className="space-y-4 text-white/80">
          <p>{t.tutorial.ready.description}</p>
          <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#ff4d94]/10 rounded-xl p-4 border border-[#00d4ff]/30">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] text-lg font-bold">
                ?
              </div>
              <p className="text-sm">{t.tutorial.practiceHint}</p>
            </div>
          </div>
          <p className="text-sm text-center text-[#64748b]">
            {t.tutorial.goal.replace('{title}', t.difficulty.god)}
          </p>
        </div>
      ),
    },
  ];
}

export function TutorialDialog({ isOpen, onClose }: TutorialDialogProps) {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = buildSlides(t);
  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNext = () => {
    if (isLastSlide) {
      setTutorialSeen();
      onClose();
      setCurrentSlide(0);
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentSlide(0);
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${slide.iconColor} flex items-center justify-center text-white text-lg font-black`}>
            {slide.icon}
          </span>
          <span>{slide.title}</span>
        </DialogTitle>
      </DialogHeader>

      <DialogContent className="min-h-[200px]">
        {slide.content}
      </DialogContent>

      <DialogFooter className="flex-col sm:flex-row gap-2">
        {/* 슬라이드 인디케이터 */}
        <div className="flex gap-1.5 flex-1 justify-center sm:justify-start">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-[#00d4ff] w-4'
                  : 'bg-[#1a1f35] hover:bg-[#1a1f35]/80'
              }`}
            />
          ))}
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex gap-2">
          {currentSlide > 0 && (
            <Button variant="secondary" onClick={handlePrev}>
              {t.tutorial.prev}
            </Button>
          )}
          <Button variant="primary" onClick={handleNext}>
            {isLastSlide ? t.common.start : t.common.next}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
