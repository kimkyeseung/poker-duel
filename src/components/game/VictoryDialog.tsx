'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

interface VictoryDialogProps {
  isOpen: boolean;
  onGoHome: () => void;
  onWriteComment: () => void;
}

export function VictoryDialog({
  isOpen,
  onGoHome,
  onWriteComment,
}: VictoryDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={() => {}}>
      <DialogHeader>
        <DialogTitle className="text-center">
          <span className="text-amber-400 text-2xl">🏆 축하합니다!</span>
        </DialogTitle>
      </DialogHeader>

      <DialogContent className="space-y-6">
        {/* 축하 메시지 */}
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">👑</div>
          <h2 className="text-2xl font-bold text-white">
            홀덤의 신을 클리어했습니다!
          </h2>
          <p className="text-slate-400">
            당신은 이제 진정한 확률 마스터입니다.
          </p>
        </div>

        {/* 달성 정보 */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/30">
          <div className="text-center">
            <div className="text-sm text-amber-400 mb-1">획득 칭호</div>
            <div className="text-xl font-bold text-white">🎯 홀덤의 신</div>
          </div>
        </div>

        {/* 코멘트 유도 */}
        <div className="text-center text-slate-400 text-sm">
          클리어 소감을 남겨주세요!
        </div>
      </DialogContent>

      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button variant="ghost" onClick={onGoHome} className="w-full sm:w-auto">
          메인으로
        </Button>
        <Button variant="primary" onClick={onWriteComment} className="w-full sm:w-auto">
          소감 작성하기
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
