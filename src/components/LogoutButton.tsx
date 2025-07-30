"use client";

import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full btn-secondary bg-red-600 hover:bg-red-700 focus:ring-red-500"
    >
      로그아웃
    </button>
  );
} 