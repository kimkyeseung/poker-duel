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
      author: authorName.trim() || '익명의 홀덤 신',
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
          <div className="text-amber-500 font-bold text-lg">🏆 명예의 전당</div>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* 타이틀 */}
          <div className="text-center space-y-2">
            <div className="text-5xl">👑</div>
            <h1 className="text-2xl font-bold text-white">홀덤의 신 클리어!</h1>
            <p className="text-slate-400">
              클리어 소감을 남겨주세요
            </p>
          </div>

          {/* 코멘트 작성 */}
          {!hasSubmitted ? (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">닉네임 (선택)</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="익명의 홀덤 신"
                  maxLength={20}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">소감</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="클리어 소감을 남겨주세요..."
                  maxLength={200}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                />
                <div className="text-right text-xs text-slate-500 mt-1">
                  {newComment.length}/200
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={!newComment.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? '등록 중...' : '소감 등록'}
              </Button>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-emerald-400 font-semibold">소감이 등록되었습니다!</p>
            </div>
          )}

          {/* 코멘트 목록 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>💬</span>
              클리어 소감 ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                아직 등록된 소감이 없습니다.<br />
                첫 번째 클리어 소감을 남겨보세요!
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
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">👑</span>
          <span className="font-semibold text-white">{comment.author}</span>
        </div>
        <span className="text-xs text-slate-500">{dateString}</span>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">{comment.content}</p>
    </div>
  );
}
