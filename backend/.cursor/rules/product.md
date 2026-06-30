# Room Reservation — Product

교회 공간 예약 웹 서비스. 일반 사용자가 건물/공간을 예약하고, 관리자가 승인·조정한다.

## 도메인 & 관계

- `User` (이름, 전화번호) ──< `Reservation` : 등록자(누가 예약했는지 식별)
- `Building` (본당 / 비전랜드 / 드림랜드) ──< `Space` : 건물 1 : 공간 N
- `Space` (중등부 / 고등부 / 초등부 ...) ──< `Reservation` : 어떤 공간 예약인지
- 관리자(Admin)는 엔티티가 아님 — 단일 비밀번호로만 존재, 모든 도메인을 조정

### 모듈 구조
- `Building` / `Space` / `Reservation`은 하나의 바운디드 컨텍스트로 보고 **`app/reservation/` 단일 모듈**에 묶는다.
- 단, 셋은 각각 **독립 애그리거트 루트** — 각자 레포지토리를 가지며 서로는 **ID로만 참조**(객체 중첩 금지).
  - `Reservation`은 `user_id`, `space_id`를 ULID로 보유. building/space 상세가 응답에 필요하면 read 단계(조립/조인)에서 푼다.

## 행위자

- 일반 사용자: 이름 + 전화번호로 식별되는 예약용 신원 (정식 계정 아님)
- 관리자: 이름/전화번호 없이 단일 비밀번호 (.env `ADMIN_PASSWORD`)

## 인증 규칙

- 예약/건물/공간 조회: 로그인 없이 공개
- 예약 생성/변경/취소: 로그인 필요 (본인 예약만)
- 건물/공간 등록·삭제, 예약 승인/거부: 관리자 권한 필요
- 사용자 로그인(이름+전화번호):
  - 전화번호 없음 → 신규 생성
  - 전화번호 있음 + 이름 일치 → 로그인
  - 전화번호 있음 + 이름 불일치 → 거부(401)
- 관리자 로그인: 비밀번호 일치 시 통과
- 토큰: JWT access/refresh, `role`(USER/ADMIN) 클레임으로 권한 구분

## 핵심 기능

사용자
- 이름+전화번호로 로그인 ✅
- 공간 예약 신청 (상태: PENDING으로 생성) ✅
- 본인 예약 조회 ✅ / 변경(시간) ✅ / 취소 ✅
- 예약 현황 조회 (로그인 불필요) ✅

관리자
- 비밀번호 로그인 ✅
- 건물/공간 등록·삭제 ✅
- 전체 예약 조회 (상태 필터) ✅
- 예약 승인 / 거부 ✅
- 예약 조정·취소 (관리자) — 예정

## 건물 / 공간 규칙

- 삭제 정책: **하드 삭제 + `ON DELETE RESTRICT`**
  - 하위 `Space`가 있는 `Building` 삭제 → 거부(409)
  - 예약이 걸린 `Space` 삭제 → DB FK(RESTRICT)로 보호 (애플리케이션 사전 검사는 추후 연결)
- 이름 유니크: `Building.name` 전역 유니크, `Space`는 `UNIQUE(building_id, name)`
- 초기 데이터: 시드 없이 빈 상태로 시작, 관리자가 CRUD로 등록
- 목록 조회는 공개 (예약 폼에서 선택해야 하므로)

## 예약 규칙

- 모든 예약은 기본 `PENDING`으로 생성 → 관리자 승인 필요
- 시간 구간: 자유 datetime 범위 (`start_at` / `end_at`, timezone-aware). `start_at < end_at` 강제 (DB CHECK + 도메인 검증). 과거 시각도 허용.
- 예약마다 등록자(User) 식별

### 상태 머신
- 상태: `PENDING` / `APPROVED` / `REJECTED` / `CANCELLED` (Postgres 네이티브 enum)
- 전이:
  - 생성 → `PENDING`
  - `PENDING` → `APPROVED` (관리자 승인) / `REJECTED` (관리자 거부)
  - `PENDING`·`APPROVED` → `CANCELLED` (본인 취소)
  - `PENDING`·`APPROVED` → 시간 변경(reschedule) 시 **항상 `PENDING`으로 리셋** (변경된 슬롯은 관리자 재승인 대상)
  - `REJECTED` / `CANCELLED` 는 종료 상태 — 변경/취소 불가(409)
- 변경/취소는 **본인 예약만** 가능 (소유자 불일치 시 403)

### 동시 예약 충돌 방지 (확정)
- **충돌 정의 A — 생성 시점 배타**: `PENDING` + `APPROVED`가 활성 상태로, 같은 `Space`에 시간이 겹치면 거부.
  - 즉 `PENDING`도 슬롯을 선점한다(선착순). 거부/취소되면 슬롯이 풀린다.
  - 한 슬롯엔 활성 예약이 단 하나뿐 → 관리자가 경합 신청 중 고르는 상황은 발생하지 않음.
- **메커니즘**: Postgres `EXCLUDE` 제약 + `btree_gist`로 DB가 원천 차단(경쟁 상태 불가). 위반 시 409.
  ```sql
  EXCLUDE USING gist (space_id WITH =, tstzrange(start_at, end_at, '[)') WITH &&)
  WHERE (status IN ('PENDING', 'APPROVED'))
  ```
- **구간 의미**: 반열린 `[start, end)` — 끝 시각 == 다음 시작 시각이면 겹침 아님(연속 예약 허용).

## 구현 상태

- 완료: 인증/유저 도메인, 인프라(Docker, async SQLAlchemy, Alembic)
- 완료: building / space 도메인 (관리자 CRUD + 공개 조회)
- 완료: reservation 도메인 — 생성/조회/시간변경/취소 + 관리자 승인/거부, 동시성(EXCLUDE) 확정·검증
- 예정: 관리자 예약 조정·취소, 예약 현황 조회 시 개인정보 노출 범위 정리
