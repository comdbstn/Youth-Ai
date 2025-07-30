# Youth Ai - 당신의 AI 라이프 코치

Youth Ai는 개인의 성장과 발전을 돕는 AI 기반 라이프 코칭 웹 애플리케이션입니다. 목표 관리, 루틴 추적, 일기 작성, AI 상담 등 다양한 기능을 통해 더 나은 삶을 만들어갈 수 있도록 도와줍니다.

## 🌟 주요 기능

- **🏠 홈 대시보드**: 오늘의 브리핑과 목표 관리
- **💬 AI 챗봇 (Yof)**: GPT 기반 개인 AI 코치 + 크로스탭 통합
- **📖 일기장**: 감정 분석이 포함된 일기 작성
- **💪 루틴 추적**: 습관 관리 및 진행상황 추적
- **🔮 오늘의 운세**: AI가 생성하는 맞춤형 운세
- **🧘 디지털 디톡스**: 포모도로 타이머
- **⚙️ 설정**: 프로필 관리

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (Database, Auth, Realtime)
- **AI**: OpenAI GPT-4o-mini, Vercel AI SDK
- **Icons**: Lucide React
- **Date**: date-fns

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd Youth-Ai
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase Configuration (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (필수)
OPENAI_API_KEY=your_openai_api_key

# User Configuration (선택사항 - 단일 사용자용)
NEXT_PUBLIC_AUTH_EMAIL=your_email@example.com
USER_PASSWORD=your_secure_password
```

### 4. Supabase 테이블 설정
Supabase 대시보드에서 다음 테이블들을 생성하세요:

```sql
-- goals 테이블
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- routines 테이블  
CREATE TABLE routines (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- journal_entries 테이블
CREATE TABLE journal_entries (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    entry_text TEXT NOT NULL,
    emotion TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. 개발 서버 실행
```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 🚀 Vercel 배포

### 환경변수 설정 (중요!)
Vercel 대시보드에서 다음 환경변수들을 반드시 설정해야 합니다:

1. **Settings** > **Environment Variables**로 이동
2. 다음 변수들을 추가:

```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key  
OPENAI_API_KEY = your_openai_api_key
NEXT_PUBLIC_AUTH_EMAIL = your_email@example.com (선택사항)
```

3. **모든 환경(Production, Preview, Development)**에 적용
4. **Redeploy** 버튼 클릭

## 📱 PWA 지원

Youth Ai는 Progressive Web App으로 구축되어 모바일 기기에서 네이티브 앱과 같은 경험을 제공합니다.

- 홈 화면 설치 가능
- 오프라인 기본 지원
- 모바일 최적화된 UI/UX

## 🤖 AI 기능

Youth Ai의 Yof 챗봇은 다음과 같은 도구들을 사용할 수 있습니다:

- **목표 관리**: 추가, 수정, 삭제, 완료 상태 변경
- **루틴 관리**: 추가, 삭제, 횟수 증가
- **일기 관리**: 작성, 삭제 (감정 분석 포함)
- **전체 상태 조회**: 모든 데이터 종합 분석
- **크로스탭 모니터링**: 다른 탭 활동 실시간 감지

## 🎨 디자인 시스템

- **테마**: 푸른 밤바다 (블루/블랙 조합)
- **폰트**: Noto Sans Korean
- **반응형**: 모바일 우선 설계
- **다크모드**: 기본 지원

## 🔧 문제 해결

### 빌드 오류 시
1. 환경변수가 모두 설정되었는지 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. OpenAI API 키가 유효한지 확인

### 404 오류 시
1. Vercel에서 환경변수 재설정
2. 프로젝트 재배포
3. 도메인 설정 확인

## 📝 라이센스

이 프로젝트는 개인용으로 제작되었습니다.

## 🤝 기여하기

개선사항이나 버그 발견 시 이슈를 등록해주세요.
