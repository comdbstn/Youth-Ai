import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // API 라우트, 정적 파일, 인증 페이지는 미들웨어 건너뛰기
    if (
      pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/auth') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 보호된 페이지들 (로그인이 필요한 페이지)
    const protectedPaths = ['/chat', '/journal', '/routines', '/fortune', '/detox', '/settings'];
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    // 보호된 페이지에 접근하려는데 로그인이 안된 경우
    if (isProtectedPath && !session) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // 홈페이지("/")는 로그인 여부와 관계없이 접근 가능하지만 
    // 로그인 상태에 따라 다른 내용을 보여줌

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // 오류 발생 시 그냥 통과시키기
    return NextResponse.next();
  }
}

export const config = {
  // 미들웨어를 실행하지 않을 경로들 (정적 파일, API 라우트 등)
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|manifest.json|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.ico).*)',
  ],
}; 