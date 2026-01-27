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
    title: 'Welcome',
    icon: 'P',
    iconColor: 'from-[#ff4d94] to-[#ff0080]',
    content: (
      <div className="space-y-3 text-white/80">
        <p>
          <strong className="text-white">Poker Duel</strong> is a game where you predict
          Texas Hold'em win rates.
        </p>
        <p>
          Compete 1v1 against the dealer. Predict the correct win rate each round
          to advance to the next difficulty level.
        </p>
      </div>
    ),
  },
  {
    title: 'Game Flow',
    icon: 'G',
    iconColor: 'from-[#00d4ff] to-[#0066ff]',
    content: (
      <div className="space-y-3 text-white/80">
        <div className="bg-[#1a1f35] rounded-xl p-4">
          <div className="font-bold text-white mb-2">4 Rounds</div>
          <ul className="space-y-1 text-sm">
            <li>• <span className="text-[#00ff88]">Preflop</span>: 0 community cards</li>
            <li>• <span className="text-[#00d4ff]">Flop</span>: 3 community cards</li>
            <li>• <span className="text-[#ffd700]">Turn</span>: 4 community cards</li>
            <li>• <span className="text-[#ff4d94]">River</span>: 5 community cards</li>
          </ul>
        </div>
        <p className="text-sm">
          Answer correctly in all rounds to win!
        </p>
      </div>
    ),
  },
  {
    title: 'Difficulty Levels',
    icon: 'D',
    iconColor: 'from-[#ffd700] to-[#ffb800]',
    content: (
      <div className="space-y-3 text-white/80">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="bg-[#00ff88]/20 text-[#00ff88] px-2 py-0.5 rounded-full text-xs font-bold">EASY</span>
            Choose who has the better hand
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-[#00d4ff]/20 text-[#00d4ff] px-2 py-0.5 rounded-full text-xs font-bold">NORMAL</span>
            Select win rate range (5 options)
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-[#ffd700]/20 text-[#ffd700] px-2 py-0.5 rounded-full text-xs font-bold">HARD</span>
            Enter exact value (±5%)
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-[#ff4d94]/20 text-[#ff4d94] px-2 py-0.5 rounded-full text-xs font-bold">EXPERT</span>
            Enter exact value (±3%)
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-[#ff4444]/20 text-[#ff4444] px-2 py-0.5 rounded-full text-xs font-bold">GOD</span>
            Enter exact value (±1%)
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Time Limits',
    icon: 'T',
    iconColor: 'from-[#ff4444] to-[#cc0000]',
    content: (
      <div className="space-y-3 text-white/80">
        <div className="bg-[#1a1f35] rounded-xl p-4">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Preflop</span>
              <span className="text-[#00d4ff] font-bold">5 seconds</span>
            </li>
            <li className="flex justify-between">
              <span>Flop / Turn / River</span>
              <span className="text-[#00d4ff] font-bold">10 seconds</span>
            </li>
          </ul>
        </div>
        <p className="text-sm text-[#ff4444]">
          Warning: Failure to answer in time = Game Over!
        </p>
        <p className="text-sm">
          Practice mode has no time limits.
        </p>
      </div>
    ),
  },
  {
    title: 'Ready to Play',
    icon: 'R',
    iconColor: 'from-[#00ff88] to-[#00cc66]',
    content: (
      <div className="space-y-4 text-white/80">
        <p>
          You're ready to start playing!
        </p>
        <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#ff4d94]/10 rounded-xl p-4 border border-[#00d4ff]/30">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] text-lg font-bold">
              ?
            </div>
            <p className="text-sm">
              If you're new, try <span className="text-[#00d4ff] font-bold">Practice Mode</span> first
              to play without time limits!
            </p>
          </div>
        </div>
        <p className="text-sm text-center text-[#64748b]">
          Clear all 5 difficulty levels to become the<br />
          <span className="text-[#ffd700] font-bold">Poker God</span>!
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
          {TUTORIAL_SLIDES.map((_, index) => (
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
              Back
            </Button>
          )}
          <Button variant="primary" onClick={handleNext}>
            {isLastSlide ? 'Start' : 'Next'}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
