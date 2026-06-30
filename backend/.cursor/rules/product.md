# Room Reservation — Product

교회 공간 예약 웹 서비스. 일반 사용자가 건물/공간을 예약하고, 관리자가 승인·조정한다.

## 도메인 & 관계

- `User` (이름, 전화번호) ──< `Reservation` : 등록자(누가 예약했는지 식별)
- `Building` (본당 / 비전랜드 / 드림랜드) ──< `Space` : 건물 1 : 공간 N
- `Space` (중등부 / 고등부 / 초등부 ...) ──< `Reservation` : 어떤 공간 예약인지
- 관리자(Admin)는 엔티티가 아님 — 단일 비밀번호로만 존재, 모든 도메인을 조정

## 행위자

- 일반 사용자: 이름 + 전화번호로 식별되는 예약용 신원 (정식 계정 아님)
- 관리자: 이름/전화번호 없이 단일 비밀번호 (.env `ADMIN_PASSWORD`)

## 인증 규칙

- 예약 조회: 로그인 없이 공개
- 예약 생성/변경/취소: 로그인 필요
- 사용자 로그인(이름+전화번호):
  - 전화번호 없음 → 신규 생성
  - 전화번호 있음 + 이름 일치 → 로그인
  - 전화번호 있음 + 이름 불일치 → 거부(401)
- 관리자 로그인: 비밀번호 일치 시 통과
- 토큰: JWT access/refresh, `role`(USER/ADMIN) 클레임으로 권한 구분

## 핵심 기능

사용자
- 이름+전화번호로 로그인
- 공간 예약 신청 (상태: PENDING으로 생성)
- 본인 예약 조회/변경/취소
- 예약 현황 조회 (로그인 불필요)

관리자
- 비밀번호 로그인
- 건물/공간 등록·관리
- 전체 예약 조회 (상태 필터)
- 예약 승인 / 거부
- 예약 조정·취소

## 예약 규칙

- 모든 예약은 기본 PENDING → 관리자 승인 필요 (APPROVED / REJECTED / CANCELLED)
- 예약 시간은 자유 datetime 범위(start_at / end_at)
- 예약마다 등록자(User) 식별

## 구현 상태

- 완료: 인증/유저 도메인 (user login, admin login, refresh, me), 인프라(Docker, async SQLAlchemy, Alembic)
- 예정: building, space, reservation 도메인
- 별도 논의: 동시 예약 충돌 방지 (EXCLUDE 제약 / 행 잠금 / 낙관적 잠금 / 격리수준)
