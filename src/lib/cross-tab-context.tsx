"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface TabActivity {
  id: string;
  type: 'page_visit' | 'goal_add' | 'goal_complete' | 'routine_increment' | 'journal_add' | 'user_action';
  page: string;
  timestamp: number;
  data?: Record<string, unknown>;
  description: string;
}

interface CrossTabContextType {
  activities: TabActivity[];
  currentPage: string;
  broadcastActivity: (activity: Omit<TabActivity, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
}

const CrossTabContext = createContext<CrossTabContextType | null>(null);

export const useCrossTab = () => {
  const context = useContext(CrossTabContext);
  if (!context) {
    throw new Error('useCrossTab must be used within a CrossTabProvider');
  }
  return context;
};

export const CrossTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<TabActivity[]>([]);
  const [currentPage, setCurrentPage] = useState('');
  const [channel, setChannel] = useState<BroadcastChannel | null>(null);

  useEffect(() => {
    // BroadcastChannel 초기화
    const bc = new BroadcastChannel('youth-ai-tabs');
    setChannel(bc);

    // 현재 페이지 감지
    const updateCurrentPage = () => {
      setCurrentPage(window.location.pathname);
    };
    updateCurrentPage();
    window.addEventListener('popstate', updateCurrentPage);

    // 다른 탭에서 오는 메시지 수신
    bc.onmessage = (event) => {
      const activity: TabActivity = event.data;
      setActivities(prev => [...prev.slice(-49), activity]); // 최대 50개 활동 유지
    };

    // 페이지 방문 활동 브로드캐스트
    const visitActivity: Omit<TabActivity, 'id' | 'timestamp'> = {
      type: 'page_visit',
      page: window.location.pathname,
      description: `${getPageName(window.location.pathname)} 페이지 방문`
    };
    
    setTimeout(() => {
      broadcastActivityInternal(visitActivity);
    }, 100);

    return () => {
      bc.close();
      window.removeEventListener('popstate', updateCurrentPage);
    };
  }, []);

  const getPageName = (path: string): string => {
    const pageNames: Record<string, string> = {
      '/': '홈',
      '/chat': '채팅',
      '/journal': '일기',
      '/routines': '루틴',
      '/fortune': '운세',
      '/detox': '디지털 디톡스',
      '/settings': '설정'
    };
    return pageNames[path] || path;
  };

  const broadcastActivityInternal = useCallback((activity: Omit<TabActivity, 'id' | 'timestamp'>) => {
    if (!channel) return;
    
    const fullActivity: TabActivity = {
      ...activity,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    channel.postMessage(fullActivity);
    setActivities(prev => [...prev.slice(-49), fullActivity]);
  }, [channel]);

  const broadcastActivity = useCallback((activity: Omit<TabActivity, 'id' | 'timestamp'>) => {
    broadcastActivityInternal(activity);
  }, [broadcastActivityInternal]);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  return (
    <CrossTabContext.Provider value={{
      activities,
      currentPage,
      broadcastActivity,
      clearActivities
    }}>
      {children}
    </CrossTabContext.Provider>
  );
}; 