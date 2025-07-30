"use client";

import { useState, useEffect } from 'react';

const TodayBriefing = () => {
  const [briefing, setBriefing] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBriefing = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/briefing');
        if (!response.ok) {
          throw new Error('Failed to fetch briefing');
        }
        const data = await response.json();
        setBriefing(data.briefing);
      } catch (error) {
        console.error(error);
        setBriefing('브리핑을 불러오는 데 실패했습니다.');
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
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
        </div>
      ) : (
        <p className="text-gray-300 whitespace-pre-wrap">{briefing}</p>
      )}
    </div>
  );
};

export default TodayBriefing; 