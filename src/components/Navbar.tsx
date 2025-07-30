"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  RotateCcw, 
  Sparkles, 
  Smartphone, 
  Settings 
} from 'lucide-react';

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { 
      href: '/', 
      icon: Home, 
      label: '홈',
      activeColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    { 
      href: '/chat', 
      icon: MessageSquare, 
      label: '채팅',
      activeColor: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    { 
      href: '/journal', 
      icon: BookOpen, 
      label: '일기',
      activeColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    { 
      href: '/routines', 
      icon: RotateCcw, 
      label: '루틴',
      activeColor: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    { 
      href: '/fortune', 
      icon: Sparkles, 
      label: '운세',
      activeColor: 'text-pink-400',
      bgColor: 'bg-pink-500/20'
    },
    { 
      href: '/detox', 
      icon: Smartphone, 
      label: '디톡스',
      activeColor: 'text-teal-400',
      bgColor: 'bg-teal-500/20'
    },
    { 
      href: '/settings', 
      icon: Settings, 
      label: '설정',
      activeColor: 'text-gray-400',
      bgColor: 'bg-gray-500/20'
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex flex-col items-center justify-center gap-1 sm:gap-2 
                    px-2 sm:px-3 py-2 sm:py-3 rounded-xl transition-all duration-300
                    hover:scale-105 group relative min-w-0 flex-1
                    ${isActive 
                      ? `${item.bgColor} ${item.activeColor}` 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <div className={`
                    p-1.5 sm:p-2 rounded-lg transition-all duration-300
                    ${isActive ? 'bg-white/20 shadow-lg' : 'group-hover:bg-white/10'}
                  `}>
                    <Icon 
                      className={`
                        w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300
                        ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                      `} 
                    />
                  </div>
                  <span className={`
                    text-xs sm:text-sm font-medium transition-all duration-300 truncate
                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}
                  `}>
                    {item.label}
                  </span>
                  
                  {/* 활성 상태 인디케이터 */}
                  {isActive && (
                    <div className={`
                      absolute -top-1 left-1/2 transform -translate-x-1/2
                      w-8 sm:w-12 h-1 ${item.activeColor.replace('text-', 'bg-')} rounded-full
                      opacity-80
                    `} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 