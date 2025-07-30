"use client";

import { useState, useEffect } from 'react';
import SkeletonLoader from '@/components/SkeletonLoader';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

const FortunePage = () => {
  const [fortune, setFortune] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFortune = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/fortune');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFortune(data.fortune || '운세를 불러올 수 없습니다.');
      } catch (error) {
        console.error('Error fetching fortune:', error);
        setError('운세를 불러오는 데 실패했습니다.');
        setFortune('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFortune();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">오늘의 운세 🔮</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg min-h-[200px] flex items-center justify-center">
        {isLoading ? (
          <div className="w-full">
            <SkeletonLoader count={3} className="h-4 mb-2" />
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="text-center w-full">
            <div className="text-4xl mb-4">🌟</div>
            <p className="text-lg text-blue-300 whitespace-pre-wrap leading-relaxed">
              {fortune}
            </p>
            <div className="mt-4 text-sm text-gray-400">
              {new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FortunePage; 