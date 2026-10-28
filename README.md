# 통근길 플레이리스트 - Frontend_ONAD

ONBEAT 음악 스트리밍 서비스에서 발생하는 광고 노출 및 클릭 데이터를 분석하고, 광고 캠페인을 관리하는 웹 기반 광고주 대시보드입니다.

광고주는 캠페인을 등록하고 타겟 조건 및 운영 일정을 설정할 수 있으며, 수집된 광고 데이터를 기반으로 노출 수, 클릭 수, CTR(클릭률) 등의 광고 성과를 확인할 수 있습니다.

- 조직: [Techeer-2026-2](https://github.com/Techeer-2026-2) · 팀 D (5명)
- 일정: **P1 ~ 10/7** · **P2 ~ 10/16** · P3(고도화) 이후
- 팀 Notion: [2026-하반기-팀프로젝트-d](https://app.notion.com/p/2026-d-3c8dc21d58f080eb89e6c34d9651f266)
  (기능 명세서 / API 명세서 / ERD 는 Notion 이 기준)

---

## 기술 스택

| 구분 | 스택 |
|---|---|
| 언어 | JavaScript |
| 프레임워크 | React |
| 빌드 | Vite |
| CSS | Tailwind CSS |
| 상태 관리 | Zustand |
| 서버 상태 관리 | TanStack Query |
| 코드 품질 관리 | ESLint |
| 배포 | AWS S3 + CloudFront |

---

### 1. 저장소 클론

```bash
git clone https://github.com/Techeer-2026-2/frontend-onad.git
cd onad
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

필요한 환경 변수를 설정합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:5173
```

### 5. 프로덕션 빌드

```bash
npm run build
```

### 6. 빌드 결과 확인

```bash
npm run preview
```

---

## 기술 스택

| 구분 | 스택 |
|---|---|
| 언어 | JavaScript |
| 프레임워크 | React |
| 빌드 | Vite |
| CSS | Tailwind CSS |
| 상태 관리 | Zustand |
| 라우팅 | React Router |
| 차트 시각화 | Recharts (도입 예정) |
| 아이콘 | Lucide React |
| 코드 품질 관리 | ESLint |
| 배포 | AWS S3 + CloudFront (계획) |

---

## 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/Techeer-2026-2/frontend-onad.git
cd frontend-onad
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:5173
```

### 4. 프로덕션 빌드

```bash
npm run build
```

### 5. 빌드 결과 확인

```bash
npm run preview
```

### 6. 코드 검사

```bash
npm run lint
```

---

## 프로젝트 구조

```text
src/
├── components/
│   ├── CampaignTable.jsx
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   └── kpiCard.jsx
│
├── data/
│   └── campaigns.js
│
├── layouts/
│   └── DashboardLayout.jsx
│
├── pages/
│   ├── Account.jsx
│   ├── CampaignCreate.jsx
│   ├── CampaignDetail.jsx
│   ├── CampaignList.jsx
│   ├── Dashboard.jsx
│   └── Login.jsx
│
├── stores/
│   └── campaignStore.js
│
├── App.jsx
├── index.css
└── main.jsx
```

---

## 관련 저장소

### 음악 스트리밍 서비스 - ONBEAT

통근 정보에 맞춘 음악 추천 및 광고 배너 노출 기능을 제공하는 사용자용 서비스입니다.

- Repository: [frontend-onbeat](https://github.com/Techeer-2026-2/frontend-onbeat)

### 백엔드

광고 캠페인 관리, 광고 노출 및 클릭 이벤트 수집, 성과 데이터 집계를 위한 백엔드 프로젝트입니다.

- Repository: [backend](https://github.com/Techeer-2026-2/backend)

### 광고 성과 분석 - ONAD

광고주를 위한 캠페인 관리 및 광고 성과 분석 프론트엔드입니다.

- Repository: [frontend-onad](https://github.com/Techeer-2026-2/frontend-onad)
