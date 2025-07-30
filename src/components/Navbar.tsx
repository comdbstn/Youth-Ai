'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Book, Repeat, Wind, Settings, Shield } from 'lucide-react';

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/chat', label: '채팅', icon: MessageSquare },
  { href: '/journal', label: '일기', icon: Book },
  { href: '/routines', label: '루틴', icon: Repeat },
  { href: '/fortune', label: '운세', icon: Wind },
  { href: '/detox', label: '디톡스', icon: Shield },
  { href: '/settings', label: '설정', icon: Settings },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 shadow-lg">
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link href={href} key={label} legacyBehavior>
              <a
                className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors duration-200 ${
                  isActive
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-6 w-6 mb-1 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                <span className="truncate">{label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar; 