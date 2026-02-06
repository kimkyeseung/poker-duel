'use client';

import { useCallback, useRef, useState } from 'react';
import { Card, WinRateResult, WinRateResultWithAnalytics } from '@/types';

interface CalculatorState {
  isCalculating: boolean;
  result: WinRateResult | null;
  error: string | null;
  isCalculatingDetails: boolean;
  detailsResult: WinRateResultWithAnalytics | null;
}

export function usePokerCalculator() {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<CalculatorState>({
    isCalculating: false,
    result: null,
    error: null,
    isCalculatingDetails: false,
    detailsResult: null,
  });

  // Worker 초기화
  const initWorker = useCallback(() => {
    if (typeof window === 'undefined') return null;

    if (!workerRef.current) {
      // Version-based cache busting (update when worker logic changes)
      workerRef.current = new Worker('/workers/poker-calculator.js?v=3');
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
            setState(prev => ({ ...prev, isCalculating: false, result, error: null }));
            resolve(result);
          });
          return;
        }

        setState(prev => ({ ...prev, isCalculating: true, result: null, error: null }));

        const handleMessage = (e: MessageEvent) => {
          if (e.data.type === 'result') {
            setState(prev => ({ ...prev, isCalculating: false, result: e.data.data, error: null }));
            resolve(e.data.data);
          } else if (e.data.type === 'error') {
            setState(prev => ({ ...prev, isCalculating: false, result: null, error: e.data.error }));
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

  // 상세 정보 포함 승률 계산
  const calculateWithDetails = useCallback(
    (
      playerHand: [Card, Card],
      computerHand: [Card, Card],
      communityCards: Card[] = []
    ): Promise<WinRateResultWithAnalytics> => {
      return new Promise((resolve, reject) => {
        const worker = initWorker();

        if (!worker) {
          // SSR 환경에서는 동기 계산 (fallback) - 상세 정보 없이 반환
          import('@/lib/poker/calculator').then(({ calculateWinRate }) => {
            const result = calculateWinRate(playerHand, computerHand, communityCards);
            const resultWithDetails: WinRateResultWithAnalytics = {
              ...result,
              outcomes: [],
              playerHandDistribution: {},
              computerHandDistribution: {},
              matchupBreakdowns: [],
            };
            setState(prev => ({ ...prev, isCalculatingDetails: false, detailsResult: resultWithDetails }));
            resolve(resultWithDetails);
          });
          return;
        }

        setState(prev => ({ ...prev, isCalculatingDetails: true, detailsResult: null }));

        const handleMessage = (e: MessageEvent) => {
          if (e.data.type === 'resultWithDetails') {
            setState(prev => ({ ...prev, isCalculatingDetails: false, detailsResult: e.data.data }));
            resolve(e.data.data);
          } else if (e.data.type === 'error') {
            setState(prev => ({ ...prev, isCalculatingDetails: false, detailsResult: null, error: e.data.error }));
            reject(new Error(e.data.error));
          }
          worker.removeEventListener('message', handleMessage);
        };

        worker.addEventListener('message', handleMessage);
        worker.postMessage({
          type: 'calculateWithDetails',
          playerHand,
          computerHand,
          communityCards,
        });
      });
    },
    [initWorker]
  );

  // 상세 결과 초기화
  const clearDetailsResult = useCallback(() => {
    setState(prev => ({ ...prev, detailsResult: null }));
  }, []);

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
    calculateWithDetails,
    clearDetailsResult,
    terminate,
  };
}
