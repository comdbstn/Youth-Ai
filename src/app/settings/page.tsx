import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import LogoutButton from '../../components/LogoutButton';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">설정</h1>

      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2 text-white">프로필</h2>
        <p className="text-gray-400">
          로그인된 이메일: <span className="font-semibold text-white">{user.email}</span>
        </p>
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
} 