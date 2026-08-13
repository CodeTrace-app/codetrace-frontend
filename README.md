<div align="center">

# Code Trace — Frontend

### 신입 개발자를 위한 B2B 코드 온보딩 도구

코드가 **왜 그렇게 작성되었는지**(커밋·PR 이력 인덱싱)와
**수정 시 영향 범위**(구문 트리 파싱)를 보여준다.

[![LikeLion](https://img.shields.io/badge/멋쟁이사자처럼-14기_해커톤-FF7F00?style=flat-square)]()
[![Backend](https://img.shields.io/badge/Backend-Repo-blue?style=flat-square)](https://github.com/CodeTrace-app/codetrace-backend)

### 🔗 [서비스 바로가기](https://codetrace-frontend.vercel.app) · [API 문서](https://codetrace-backend-hq4u.onrender.com/docs)

</div>

---

## 🛠️ 기술 스택

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
Monaco Editor · React Router

## 📂 프로젝트 구조

```
📦 frontend
├── public/
├── src/
│   ├── pages/           ← 화면 9개 (아래 표)
│   ├── components/      ← 공통 레이아웃·재사용 컴포넌트
│   ├── api/             ← 타입·엔드포인트·클라이언트·세션 저장
│   ├── auth/            ← 로그인 상태와 화면 보호
│   ├── mocks/           ← api-spec 예시 JSON (VITE_USE_MOCK)
│   ├── hooks/
│   ├── styles/          ← tokens.css (색·간격·타이포)
│   ├── utils/
│   └── App.tsx          ← 라우팅
├── .env.example
└── package.json
```

## 🗺️ 화면 (라우트)

| 경로 | 화면 | 우선순위 |
|:---|:---|:---:|
| `/` | 랜딩 | P0 |
| `/login` `/signup` | 로그인 / 회원가입 | P0 |
| `/signup/organization` | 조직 생성 (가입 직후) | P0 |
| `/dashboard` | 대시보드 (레포 카드 + 인덱싱 상태) | P0 |
| `/explorer` | **코드 탐색기 (3분할·제품 핵심)** | P0 |
| `/pricing` | 요금제 | P1 |
| `/settings/integrations` | 연동 설정 | P1 |
| `/admin` | 관리자 설정 | P2 |
| `/pr-warnings` | PR 경고 이력 | P2 |

랜딩·로그인·회원가입은 공통 헤더 **밖**에 둔다. 나머지는 `Layout`이 감싸고
`RequireAuth`가 로그인·조직 여부를 확인한다 (데모 세션도 같은 경로를 지난다).

## 🚀 실행 방법

```bash
npm install
copy .env.example .env    # macOS/Linux: cp .env.example .env
npm run dev               # http://localhost:5173
```

백엔드 주소는 `.env`의 `VITE_API_URL`로 주입한다 (하드코딩 금지):

```
# 로컬 백엔드를 띄운 경우
VITE_API_URL=http://localhost:8000

# 배포된 백엔드를 쓰는 경우 (백엔드 설치 없이 프론트만 개발할 때)
VITE_API_URL=https://codetrace-backend-hq4u.onrender.com
```

API 응답 형식은 백엔드 레포 **[docs/api-spec.md](https://github.com/CodeTrace-app/codetrace-backend/blob/develop/docs/api-spec.md)** 가 유일한 기준.
API 미완성 구간은 명세의 예시 JSON을 목데이터로 복사해 동작시킨다.

```
# 백엔드 없이 목데이터로 화면을 개발할 때
VITE_USE_MOCK=true
```

목데이터는 `src/mocks/`에 모으고, 컴포넌트에 하드코딩하지 않는다.
`src/api/client.ts`가 이 값을 보고 목/실제를 전환하므로 화면별로 하나씩 실제 API로 옮길 수 있다.

## 🌿 브랜치 전략

| 브랜치 | 용도 |
|:---:|:---|
| `main` | 배포용 (심사 URL과 연동) |
| `develop` | 개발 통합 — **PR은 여기로** |
| `feat/기능명` | 기능 개발 (예: `feat/dashboard`) |
| `fix/버그명` | 버그 수정 |

```
1. develop에서 브랜치 생성   →  git checkout -b feat/dashboard develop
2. 작업 후 커밋              →  git commit -m "feat: 대시보드 카드 UI"
3. develop으로 PR 생성       →  이슈 번호 연결 (close #N)
4. CI 통과 + PM 확인 후 머지
```

⚠️ `develop`·`main` 직접 푸시 금지 — 반드시 PR로.

## 👥 팀원

| 역할 | 담당 | GitHub |
|:---:|:---:|:---:|
| 프론트 A (탐색기·대시보드) | | [@hyorees](https://github.com/hyorees) |
| 프론트 B (랜딩·인증·설정·공통) | | [@simms0922](https://github.com/simms0922) |
| 디자인 | | [@YeonJi0201](https://github.com/YeonJi0201) |

---

<div align="center">

**🦁 멋쟁이사자처럼 대학 14기 해커톤 🦁**

</div>
