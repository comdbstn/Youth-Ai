"use client";

import { useState, useEffect } from 'react';
import SkeletonLoader from '@/components/SkeletonLoader';

const FortunePage = () => {
  const [fortune, setFortune] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFortune = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/fortune');
        const data = await response.json();
        setFortune(data.fortune);
      } catch (error) {
        console.error('Error fetching fortune:', error);
        setFortune('운세를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFortune();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">오늘의 운세</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg min-h-[200px] flex items-center justify-center">
        {isLoading ? (
          <div className="w-full">
            <SkeletonLoader count={3} className="h-4 mb-2" />
          </div>
        ) : (
          <p className="text-lg text-center text-blue-300 whitespace-pre-wrap">
            {fortune}
          </p>
        )}
      </div>
    </div>
  );
};

export default FortunePage; 