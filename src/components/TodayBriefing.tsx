"use client";

import { useState, useEffect } from 'react';
import SkeletonLoader from './SkeletonLoader';

const TodayBriefing = () => {
  const [briefing, setBriefing] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBriefing = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/briefing');
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('로그인이 필요합니다.');
          }
          throw new Error('브리핑을 불러오는 데 실패했습니다.');
        }
        const data = await response.json();
        setBriefing(data.briefing || '브리핑을 불러오는 데 실패했습니다.');
      } catch (error) {
        console.error('Briefing error:', error);
        const errorMessage = error instanceof Error ? error.message : '브리핑을 불러오는 데 실패했습니다.';
        setError(errorMessage);
        setBriefing('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBriefing();
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-2 text-white">오늘의 브리핑 ☀️</h2>
      {isLoading ? (
        <SkeletonLoader count={3} className="h-4" />
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-blue-400 text-sm hover:text-blue-300"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <p className="text-gray-300 whitespace-pre-wrap">{briefing}</p>
      )}
    </div>
  );
};

export default TodayBriefing; 