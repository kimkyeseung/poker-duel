'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { setTutorialSeen } from '@/lib/storage';

interface TutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_SLIDES = [
  {
    title: '게임 소개',
    icon: '🃏',
    content: (
      <div className="space-y-3 text-slate-300">
        <p>
          <strong className="text-white">Poker Duel</strong>은 텍사스 홀덤의 승률을
          예측하는 게임입니다.
        </p>
        <p>
          컴퓨터와 1:1로 대결하며, 각 라운드에서 정확한 승률을 맞추면
          다음 난이도로 진행합니다.
        </p>
      </div>
    ),
  },
  {
    title: '게임 진행',
    icon: '🎮',
    content: (
      <div className="space-y-3 text-slate-300">
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="font-semibold text-white mb-2">4라운드 구성</div>
          <ul className="space-y-1 text-sm">
            <li>• <span className="text-amber-400">프리플랍</span>: 커뮤니티 카드 0장</li>
            <li>• <span className="text-amber-400">플랍</span>: 커뮤니티 카드 3장</li>
            <li>• <span className="text-amber-400">턴</span>: 커뮤니티 카드 4장</li>
            <li>• <span className="text-amber-400">리버</span>: 커뮤니티 카드 5장</li>
          </ul>
        </div>
        <p className="text-sm">
          모든 라운드에서 정답을 맞추면 승리!
        </p>
      </div>
    ),
  },
  {
    title: '난이도 시스템',
    icon: '⭐',
    content: (
      <div className="space-y-3 text-slate-300">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">쉬움</span>
            누가 유리한지 선택
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">보통</span>
            승률 구간 5지선다
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">어려움</span>
            직접 입력 (±5%)
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">전문가</span>
            직접 입력 (±3%)
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded">홀덤의 신</span>
            직접 입력 (±1%)
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: '시간 제한',
    icon: '⏱️',
    content: (
      <div className="space-y-3 text-slate-300">
        <div className="bg-slate-700/50 rounded-lg p-3">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>프리플랍</span>
              <span className="text-amber-400 font-bold">5초</span>
            </li>
            <li className="flex justify-between">
              <span>플랍 / 턴 / 리버</span>
              <span className="text-amber-400 font-bold">10초</span>
            </li>
          </ul>
        </div>
        <p className="text-sm text-red-400">
          ⚠️ 시간 내에 답변하지 않으면 패배!
        </p>
        <p className="text-sm">
          연습 모드에서는 시간 제한 없이 연습할 수 있습니다.
        </p>
      </div>
    ),
  },
  {
    title: '시작하기',
    icon: '🚀',
    content: (
      <div className="space-y-4 text-slate-300">
        <p>
          이제 게임을 시작할 준비가 되었습니다!
        </p>
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-4 border border-amber-500/30">
          <div className="text-center">
            <div className="text-2xl mb-2">💡</div>
            <p className="text-sm">
              처음이라면 <span className="text-amber-400">연습 모드</span>에서
              시간 제한 없이 연습해보세요!
            </p>
          </div>
        </div>
        <p className="text-sm text-center text-slate-500">
          5단계 난이도를 모두 클리어하여<br />
          <span className="text-amber-400">홀덤의 신</span>이 되어보세요!
        </p>
      </div>
    ),
  },
];

export function TutorialDialog({ isOpen, onClose }: TutorialDialogProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLastSlide = currentSlide === TUTORIAL_SLIDES.length - 1;
  const slide = TUTORIAL_SLIDES[currentSlide];

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
        <DialogTitle className="flex items-center gap-2">
          <span className="text-2xl">{slide.icon}</span>
          <span>{slide.title}</span>
        </DialogTitle>
      </DialogHeader>

      <DialogContent className="min-h-[200px]">
        {slide.content}
      </DialogContent>

      <DialogFooter className="flex-col sm:flex-row gap-2">
        {/* 슬라이드 인디케이터 */}
        <div className="flex gap-1.5 flex-1 justify-center sm:justify-start">
          {TUTORIAL_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-amber-500 w-4'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex gap-2">
          {currentSlide > 0 && (
            <Button variant="ghost" onClick={handlePrev}>
              이전
            </Button>
          )}
          <Button variant="primary" onClick={handleNext}>
            {isLastSlide ? '완료' : '다음'}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
