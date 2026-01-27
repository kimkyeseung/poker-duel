'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { getEndingComments, addEndingComment } from '@/lib/storage';
import { EndingComment, Difficulty, DIFFICULTY_CONFIG } from '@/types';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export default function CommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<EndingComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setComments(getEndingComments());
  }, []);

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    const comment: EndingComment = {
      id: uuidv4(),
      author: authorName.trim() || 'Anonymous Champion',
      content: newComment.trim(),
      date: new Date().toISOString(),
      difficulty: 'god',
    };

    addEndingComment(comment);
    setComments(prev => [comment, ...prev]);
    setNewComment('');
    setAuthorName('');
    setIsSubmitting(false);
    setHasSubmitted(true);
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
            <span>Back</span>
          </button>
          <div className="text-[#ffd700] font-bold text-lg">HALL OF FAME</div>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* 타이틀 */}
          <div className="text-center space-y-2">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#ffd700] to-[#ffb800] flex items-center justify-center text-[#0a0e1a] text-4xl font-black">
              G
            </div>
            <h1 className="text-2xl font-black text-white">GOD MODE CLEARED!</h1>
            <p className="text-[#64748b]">
              Leave your victory message
            </p>
          </div>

          {/* 코멘트 작성 */}
          {!hasSubmitted ? (
            <div className="game-card p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#64748b] mb-2">Nickname (optional)</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Anonymous Champion"
                  maxLength={20}
                  className="w-full px-4 py-3 bg-[#0f1424] border border-white/10 rounded-xl text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-[#64748b] mb-2">Victory Message</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on clearing the game..."
                  maxLength={200}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0f1424] border border-white/10 rounded-xl text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all resize-none"
                />
                <div className="text-right text-xs text-[#64748b] mt-1">
                  {newComment.length}/200
                </div>
              </div>

              <Button
                variant="gold"
                size="lg"
                onClick={handleSubmit}
                disabled={!newComment.trim() || isSubmitting}
                fullWidth
              >
                {isSubmitting ? 'Submitting...' : 'Submit Message'}
              </Button>
            </div>
          ) : (
            <div className="bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-[#00ff88] text-xl font-bold">
                ✓
              </div>
              <p className="text-[#00ff88] font-semibold">Your message has been submitted!</p>
            </div>
          )}

          {/* 코멘트 목록 */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#ff4d94]/20 flex items-center justify-center text-[#ff4d94] text-sm">C</span>
              Victory Messages ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <div className="text-center text-[#64748b] py-8">
                No messages yet.<br />
                Be the first to leave a victory message!
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function CommentCard({ comment }: { comment: EndingComment }) {
  const date = new Date(comment.date);
  const dateString = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

  return (
    <div className="game-card p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd700] to-[#ffb800] flex items-center justify-center text-[#0a0e1a] text-sm font-bold">
            G
          </span>
          <span className="font-semibold text-white">{comment.author}</span>
        </div>
        <span className="text-xs text-[#64748b]">{dateString}</span>
      </div>
      <p className="text-white/80 text-sm leading-relaxed pl-10">{comment.content}</p>
    </div>
  );
}
