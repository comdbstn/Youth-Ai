# Youth Ai - 당신의 AI 라이프 코치

Youth Ai는 개인의 성장과 발전을 돕는 AI 기반 라이프 코칭 웹 애플리케이션입니다. 목표 관리, 루틴 추적, 일기 작성, AI 상담 등 다양한 기능을 통해 더 나은 삶을 만들어갈 수 있도록 도와줍니다.

## 🌟 주요 기능

- **🏠 홈 대시보드**: 오늘의 브리핑과 목표 관리
- **💬 AI 챗봇 (Yof)**: GPT 기반 개인 AI 코치
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
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# User Configuration
USER_EMAIL=your_email@example.com
USER_PASSWORD=your_secure_password
```

### 4. 개발 서버 실행
```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 📱 PWA 지원

Youth Ai는 Progressive Web App으로 구축되어 모바일 기기에서 네이티브 앱과 같은 경험을 제공합니다.

- 홈 화면 설치 가능
- 오프라인 기본 지원
- 모바일 최적화된 UI/UX

## 🤖 AI 기능

Youth Ai의 Yof 챗봇은 다음과 같은 도구들을 사용할 수 있습니다:

- **목표 추가**: 사용자가 말한 목표를 자동으로 목표 리스트에 추가
- **루틴 완료**: 사용자가 완료한 루틴의 횟수를 자동으로 증가
- **일기 작성**: 사용자의 하루 이야기를 바탕으로 감정 분석과 함께 일기 생성

## 🎨 디자인 시스템

- **테마**: 푸른 밤바다 (블루/블랙 조합)
- **폰트**: Noto Sans Korean
- **반응형**: 모바일 우선 설계
- **다크모드**: 기본 지원

## 📝 라이센스

이 프로젝트는 개인용으로 제작되었습니다.

## 🤝 기여하기

개선사항이나 버그 발견 시 이슈를 등록해주세요.
