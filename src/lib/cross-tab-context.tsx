"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Activity {
  id: string;
  timestamp: number;
  type: string;
  page: string;
  data: Record<string, unknown>;
  description: string;
}

interface CrossTabContextType {
  activities: Activity[];
  broadcastActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
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

interface CrossTabProviderProps {
  children: React.ReactNode;
}

export const CrossTabProvider = ({ children }: CrossTabProviderProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null);

  useEffect(() => {
    // BroadcastChannel은 클라이언트에서만 사용 가능
    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('youth-ai-activities');
      setBroadcastChannel(channel);

      channel.addEventListener('message', (event) => {
        const activity = event.data as Activity;
        setActivities(prev => [...prev.slice(-9), activity]); // 최대 10개 활동만 유지
      });

      return () => {
        channel.close();
      };
    }
  }, []);

  const broadcastActivityInternal = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const fullActivity: Activity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    // 로컬 상태 업데이트
    setActivities(prev => [...prev.slice(-9), fullActivity]);

    // 다른 탭에 브로드캐스트
    if (broadcastChannel) {
      broadcastChannel.postMessage(fullActivity);
    }

    console.log('[CrossTab] 활동 브로드캐스트:', fullActivity);
  }, [broadcastChannel]);

  useEffect(() => {
    // broadcastActivityInternal이 변경될 때마다 cleanup
  }, [broadcastActivityInternal]);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  return (
    <CrossTabContext.Provider
      value={{
        activities,
        broadcastActivity: broadcastActivityInternal,
        clearActivities,
      }}
    >
      {children}
    </CrossTabContext.Provider>
  );
}; 