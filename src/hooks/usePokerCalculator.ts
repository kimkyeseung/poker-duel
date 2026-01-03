'use client';

import { useCallback, useRef, useState } from 'react';
import { Card, WinRateResult } from '@/types';

interface CalculatorState {
  isCalculating: boolean;
  result: WinRateResult | null;
  error: string | null;
}

export function usePokerCalculator() {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<CalculatorState>({
    isCalculating: false,
    result: null,
    error: null,
  });

  // Worker 초기화
  const initWorker = useCallback(() => {
    if (typeof window === 'undefined') return null;

    if (!workerRef.current) {
      workerRef.current = new Worker('/workers/poker-calculator.js');
    }
    return workerRef.current;
  }, []);

  // 승률 계산
  const calculate = useCallback(
    (
      playerHand: [Card, Card],
      computerHand: [Card, Card],
      communityCards: Card[] = []
    ): Promise<WinRateResult> => {
      return new Promise((resolve, reject) => {
        const worker = initWorker();

        if (!worker) {
          // SSR 환경에서는 동기 계산 (fallback)
          import('@/lib/poker/calculator').then(({ calculateWinRate }) => {
            const result = calculateWinRate(playerHand, computerHand, communityCards);
            setState({ isCalculating: false, result, error: null });
            resolve(result);
          });
          return;
        }

        setState({ isCalculating: true, result: null, error: null });

        const handleMessage = (e: MessageEvent) => {
          if (e.data.type === 'result') {
            setState({ isCalculating: false, result: e.data.data, error: null });
            resolve(e.data.data);
          } else if (e.data.type === 'error') {
            setState({ isCalculating: false, result: null, error: e.data.error });
            reject(new Error(e.data.error));
          }
          worker.removeEventListener('message', handleMessage);
        };

        worker.addEventListener('message', handleMessage);
        worker.postMessage({
          type: 'calculate',
          playerHand,
          computerHand,
          communityCards,
        });
      });
    },
    [initWorker]
  );

  // Worker 정리
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    ...state,
    calculate,
    terminate,
  };
}
