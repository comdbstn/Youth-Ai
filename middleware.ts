import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function middleware(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // 로그인 상태가 아니고, 로그인 페이지가 아니라면 로그인 페이지로 리다이렉트
  if (!session && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 로그인 상태인데 로그인 페이지에 접근하려고 하면 홈으로 리다이렉트
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 미들웨어를 실행하지 않을 경로들 (주로 정적 파일)
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 