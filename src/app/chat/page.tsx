'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { useCrossTab } from '@/lib/cross-tab-context';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

export default function ChatPage() {
  const { activities, clearActivities } = useCrossTab();
  const [showActivities, setShowActivities] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      { 
        id: 'initial', 
        role: 'assistant', 
        content: '안녕하세요! Youth\'s Own Friend, Yof입니다. 저는 이제 당신의 모든 활동을 실시간으로 볼 수 있고, 필요하다면 직접 수정이나 삭제도 할 수 있어요. 무엇을 도와드릴까요?' 
      }
    ],
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 최근 활동이 있으면 Yof에게 자동으로 알림
  useEffect(() => {
    if (activities.length > 0) {
      const latestActivity = activities[activities.length - 1];
      // 5초 이내의 최근 활동만 처리
      if (Date.now() - latestActivity.timestamp < 5000) {
        console.log('Yof가 새로운 활동을 감지했습니다:', latestActivity);
      }
    }
  }, [activities]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold text-white mb-1">Yof와 대화하기</h1>
            <button
              onClick={() => setShowActivities(!showActivities)}
              className="text-xs px-2 py-1 bg-blue-600 rounded text-white"
            >
              활동 {activities.length > 0 && `(${activities.length})`}
            </button>
          </div>
          <p className="text-sm text-gray-400">저는 이제 모든 탭의 활동을 실시간으로 볼 수 있어요!</p>
        </div>

        {showActivities && (
          <div className="bg-gray-800 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-blue-300">최근 활동</h3>
              <button
                onClick={clearActivities}
                className="text-xs text-gray-400 hover:text-white"
              >
                지우기
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {activities.length > 0 ? (
                activities.slice(-10).map((activity) => (
                  <div key={activity.id} className="text-xs text-gray-300">
                    <span className="text-blue-400">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                    {' '}{activity.description}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">아직 활동이 없습니다</p>
              )}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-gray-700 text-gray-200 rounded-bl-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-200 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 flex items-center space-x-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="메시지를 입력하세요..."
          className="input flex-1"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn-primary px-6"
        >
          전송
        </button>
      </form>
    </div>
  );
} 