"use client";

import { useState, useEffect, useCallback } from 'react';

const DigitalDetoxPage = () => {
  const [time, setTime] = useState(1500); // 25분 = 1500초
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((time) => (time > 0 ? time - 1 : 0));
      }, 1000);
    }
    if (time === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, time]);

  const toggle = () => {
    if (time === 0) setTime(1500);
    setIsActive(!isActive);
    setIsPaused(false);
  };

  const reset = useCallback(() => {
    setTime(1500);
    setIsActive(false);
    setIsPaused(false);
  }, []);

  const pause = () => {
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center h-[calc(100vh-120px)]">
      <h1 className="text-2xl font-bold mb-4 text-white">디지털 디톡스</h1>
      <div className="bg-gray-800 p-8 rounded-full shadow-lg w-64 h-64 flex flex-col items-center justify-center">
        <p className="text-6xl font-mono text-blue-300">{formatTime(time)}</p>
      </div>
      <div className="flex space-x-4 mt-8">
        <button onClick={toggle} className="btn-primary w-24">
          {isActive ? '중지' : '시작'}
        </button>
        <button onClick={pause} className="btn-secondary w-24" disabled={!isActive}>
          {isPaused ? '계속' : '일시정지'}
        </button>
        <button onClick={reset} className="btn-secondary w-24">
          초기화
        </button>
      </div>
       <p className="text-center text-gray-400 mt-8 max-w-xs">
        디지털 디톡스 타이머를 사용하여 집중력을 높이고,<br/> 마음의 평화를 찾으세요.
      </p>
    </div>
  );
};

export default DigitalDetoxPage; 