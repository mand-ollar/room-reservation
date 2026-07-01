# Room Reservation — Product

교회 공간 예약 웹 서비스. 일반 사용자가 건물/공간을 예약하고, 관리자가 승인·조정한다.

## 도메인 & 관계

- `User` (이름, 전화번호) ──< `Reservation` : 등록자(누가 예약했는지 식별)
- `Building` (본당 / 비전랜드 / 드림랜드) ──< `Space` : 건물 1 : 공간 N
- `Space` (중등부 / 고등부 / 초등부 ...) ──< `Reservation` : 어떤 공간 예약인지
- `Building` / `Space` 이름은 **`names` JSONB** (`{"ko": "...", "en": "..."}`) — locale별 동등 저장, DB 컬럼명에 특정 언어 하드코딩 없음. 프론트/API는 locale에 맞는 키 선택.
- `Space`는 **`floor`(층, int)** 별도 보유 — 정렬·필터용.
- 관리자(Admin)는 엔티티가 아님 — 단일 비밀번호로만 존재, 모든 도메인을 조정

### 모듈 구조
- `Building` / `Space` / `Reservation`은 하나의 바운디드 컨텍스트로 보고 **`app/reservation/` 단일 모듈**에 묶는다.
- 단, 셋은 각각 **독립 애그리거트 루트** — 각자 레포지토리를 가지며 서로는 **ID로만 참조**(객체 중첩 금지).
  - `Reservation`은 `user_id`, `space_id`를 ULID로 보유. building/space 상세가 응답에 필요하면 read 단계(조립/조인)에서 푼다.
- 도메인 예외는 `domain/exceptions/` 패키지 — 예외 클래스별 파일 + `__init__.py`에서 재노출.

## 행위자

- 일반 사용자: 이름 + 전화번호로 식별되는 예약용 신원 (정식 계정 아님)
- 관리자: 이름/전화번호 없이 단일 비밀번호 (.env `ADMIN_PASSWORD`)

## 인증 규칙

- 예약/건물/공간 조회: 로그인 없이 공개
- 예약 생성/변경/취소: 로그인 필요 (본인 예약만; 관리자는 모든 예약 변경·취소 가능)
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
- 예약 현황 조회 (로그인 불필요) ✅ — building 선택 → space 선택 후 해당 공간 예약만 조회

관리자
- 비밀번호 로그인 ✅
- 건물/공간 등록·수정·삭제 ✅
- 전체 예약 조회 (상태 필터) ✅ — `GET /admin/reservations` (`ReservationResponse` 전체 필드)
- 예약 승인 / 거부 ✅
- 예약 조정·취소 (관리자) ✅ — `PATCH/POST .../cancel` 동일 경로, ADMIN 토큰으로 소유권 검사 생략

## 건물 / 공간 규칙

- 삭제 정책: **하드 삭제 + `ON DELETE RESTRICT`**
  - 하위 `Space`가 있는 `Building` 삭제 → 거부(409)
  - 예약이 걸린 `Space` 삭제 → `SpaceInUseError`(409) + DB FK(RESTRICT) 이중 보호
- 이름 유니크:
  - `Building`: `names->>'ko'`, `names->>'en'` 각각 전역 유니크 (expression index)
  - `Space`: `(building_id, names->>'ko')`, `(building_id, names->>'en')` 각각 유니크
- `names` JSONB 검증 (CHECK): `ko`/`en` 키 필수, string 타입, 공백만 불가
- 초기 데이터: 시드 없이 빈 상태로 시작, 관리자가 CRUD로 등록. 로컬 편의 시드는 `scripts/seed_buildings_spaces.py` (gitignored)
- 목록 조회는 공개 (예약 폼에서 선택해야 하므로). API 응답에 `names` 객체 전체 포함 — 프론트가 locale에 맞게 표시.

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
- 변경/취소는 **본인 예약만** 가능 (소유자 불일치 시 403). **관리자**는 ADMIN JWT로 동일 API에서 모든 예약 변경·취소 가능.

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

### 조회 API (예약 현황)

UI 흐름: **building 선택 → space 선택 → 해당 space 예약 목록**. `Space`에 `building_id`가 있으므로 예약 조회 API에는 **space_id만** 넘긴다.

| 메서드 | 경로 | 권한 | 용도 |
|---|---|---|---|
| GET | `/buildings` | 공개 | building 목록 |
| GET | `/spaces?building_id=` | 공개 | 선택한 building의 space 목록 |
| GET | `/reservations/{space_id}` | 공개 | 선택한 space의 예약 목록 (`?status=` 필터). space 없으면 404. 응답: `ReservationPublicResponse` |
| GET | `/reservations` | 공개 | 전체 예약 (`?status=` 필터). 응답: `ReservationPublicResponse` |
| GET | `/reservations/me` | user | 본인 예약 목록. 응답: `ReservationResponse` (전체 필드) |
| GET | `/admin/reservations` | admin | 전체 예약 (`?status=`, `?space_id=` 필터). 응답: `ReservationResponse` |

### Building / Space API

| 메서드 | 경로 | 권한 | 용도 |
|---|---|---|---|
| PATCH | `/buildings/{building_id}` | admin | 건물 이름 수정 (`names`) |
| PATCH | `/spaces/{space_id}` | admin | 공간 이름·층 수정 (`names`, `floor`) |

### Building / Space API 응답

| 엔티티 | 필드 |
|---|---|
| `BuildingResponse` | `id`, `names` (`{ko, en}`), `created_at` |
| `SpaceResponse` | `id`, `building_id`, `names` (`{ko, en}`), `floor`, `created_at` |

생성 요청(`POST /buildings`, `POST /spaces`)도 `names: {ko, en}` (space는 `floor` 포함) 받음.

### 공개 예약 조회 응답 (`ReservationPublicResponse`)

공개 GET은 로그인 없이 호출되므로 개인정보 최소화. 필드 4개만 노출:

| 필드 | 설명 |
|---|---|
| `status` | PENDING / APPROVED / REJECTED / CANCELLED |
| `start_at` | 예약 시작 |
| `end_at` | 예약 종료 |
| `user_name` | 등록자 이름만 (`user_id`, 전화번호 노출 금지) |

`id`, `space_id`, `created_at`, `updated_at`는 공개 응답에 포함하지 않음. User 레코드가 없으면 `user_name`은 `"알 수 없음"`.

## 구현 상태

- 완료: 인증/유저 도메인, 인프라(Docker, async SQLAlchemy, Alembic)
- 완료: building / space 도메인 (관리자 CRUD + PATCH + 공개 조회, `names` JSONB / `floor`)
- 완료: CORS (`.env` `CORS_ORIGINS`, 쉼표 구분)
- 완료: reservation 도메인 — 생성/조회/시간변경/취소 + 관리자 승인/거부/조정·취소, 동시성(EXCLUDE) 확정·검증, space별 공개 조회(`GET /reservations/{space_id}`), 공개 조회 응답 개인정보 최소화(`ReservationPublicResponse`)
