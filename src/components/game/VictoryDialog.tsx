'use client';

import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/Dialog';
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
      <DialogHeader className="text-center">
        {/* Title */}
        <h1 className="text-5xl font-black text-gradient-gold text-glow-gold animate-bounce-in">
          YOU WON!
        </h1>
        <div className="flex justify-center gap-2 mt-3">
          <span className="badge badge-gold">LEVEL CLEARED</span>
          <span className="badge badge-secondary">+500 XP</span>
        </div>
      </DialogHeader>

      <DialogContent className="space-y-6">
        {/* Gold Medal */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#ffd700] to-[#ffb800] flex items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.4)] animate-pulse-glow">
              <svg className="w-14 h-14 text-[#0a0e1a]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            {/* Sparkles */}
            <div className="absolute -top-2 -right-2 text-2xl animate-float">✨</div>
            <div className="absolute -bottom-1 -left-3 text-xl animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-[#1a1f35] rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-[#64748b] text-xs">NEXT RANK</span>
              <div className="text-white font-bold">LEVEL 12 → 13</div>
            </div>
            <span className="text-[#00d4ff] font-bold">79%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill progress-bar-fill-primary" style={{ width: '79%' }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1a1f35] rounded-xl p-4 text-center">
            <div className="text-[#64748b] text-xs uppercase mb-1">Best Accuracy</div>
            <div className="text-2xl font-bold text-[#00ff88]">94.2%</div>
          </div>
          <div className="bg-[#1a1f35] rounded-xl p-4 text-center">
            <div className="text-[#64748b] text-xs uppercase mb-1">Total Score</div>
            <div className="text-2xl font-bold text-[#ffd700] tabular-nums">12,450</div>
          </div>
        </div>

        {/* Call to action */}
        <p className="text-center text-[#64748b] text-sm">
          Share your victory with the community!
        </p>
      </DialogContent>

      <DialogFooter className="flex-col sm:flex-row gap-3">
        <Button variant="success" onClick={onWriteComment} size="lg" fullWidth>
          KEEP GOING →
        </Button>
        <Button variant="secondary" onClick={onGoHome} size="md" fullWidth>
          ≡ MENU
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
