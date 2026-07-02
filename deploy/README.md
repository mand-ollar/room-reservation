# Orange Pi 배포

nginx(정적 프론트) + API + Postgres를 Docker Compose로 한 번에 띄웁니다.

## 사전 준비 (Orange Pi)

```bash
# Docker + Compose plugin
sudo apt update
sudo apt install -y git docker.io docker-compose-v2

# 현재 사용자를 docker 그룹에 (재로그인 필요)
sudo usermod -aG docker "$USER"
```

프론트 빌드는 **맥에서 빌드 후 dist만 복사**하거나, Orange Pi에 Node 20+ / pnpm 설치 후 직접 빌드할 수 있습니다.

## 1. 코드 받기

```bash
git clone https://github.com/mand-ollar/room-reservation.git
cd room-reservation
```

## 2. 환경 변수

```bash
cd deploy
cp backend.env.example .env
cp backend.env.db.example .env.db
```

`.env` / `.env.db`를 편집합니다.

| 항목 | 설명 |
|---|---|
| `JWT_SECRET_KEY` | `openssl rand -hex 32` 로 생성 |
| `ADMIN_PASSWORD` | 관리자 로그인 비밀번호 |
| `POSTGRES_PASSWORD` / `DB_PASSWORD` | **같은 값**으로 맞출 것 |

공개 IP로 접속할 계획이면 `CORS_ORIGINS`에 `http://<공인IP>` 또는 `http://<공인IP>:<포트>` 추가 (같은 출처 `/api` 프록시만 쓰면 필수는 아님).

## 3. 프론트 빌드

### A) 맥에서 빌드 후 복사 (권장)

맥:

```bash
cd frontend
cp ../deploy/frontend.env.production.example .env.production
pnpm install
pnpm build
scp -r dist <user>@<orangepi-ip>:~/room-reservation/frontend/
```

### B) Orange Pi에서 빌드

```bash
# Node 20+ 설치 후
cd frontend
cp ../deploy/frontend.env.production.example .env.production
pnpm install
pnpm build
```

## 4. 실행

```bash
cd deploy
chmod +x up.sh
./up.sh
```

또는:

```bash
cd deploy
docker compose up -d --build
```

- 마이그레이션은 `migrate` 서비스가 자동 실행
- 외부 포트 변경: `HTTP_PORT=8080 ./up.sh` (공유기에서 외부 8080 → Orange Pi 8080 포워딩)

## 5. 공유기 포트포워딩

| 외부 | 내부 (Orange Pi) |
|---|---|
| 원하는 포트 (예: 8080) | `HTTP_PORT`와 동일 (기본 80) |

접속: `http://<공인IP>:<외부포트>/`

## 6. 확인

```bash
curl http://localhost/api/health
# {"status":"ok"}

docker compose ps
docker compose logs -f api
```

브라우저에서 홈 → 예약 조회, 로그인 후 예약 등록, `/admin` 관리자 로그인.

## 7. 초기 데이터 (건물·공간)

DB는 빈 상태로 시작합니다. `seed_buildings_spaces.py`로 등록:

```bash
cd deploy
API_BASE_URL=http://127.0.0.1/api \
ADMIN_PASSWORD=<deploy/.env의_ADMIN_PASSWORD> \
uv run --project ../backend python seed_buildings_spaces.py
```

이미 건물이 있으면 스킵됩니다. 처음부터 다시 넣으려면 `docker compose down -v` 후 `./up.sh`.

## 8. 업데이트

```bash
cd ~/room-reservation
git pull

# 프론트 변경 시 dist 다시 빌드·복사
cd deploy
docker compose up -d --build
```

## 9. 중지 / 데이터

```bash
cd deploy
docker compose down          # 중지 (DB 데이터 유지)
docker compose down -v       # DB 볼륨까지 삭제 (주의)
```

## 구조

```
브라우저 → nginx:80
            ├─ /          → frontend/dist (SPA)
            └─ /api/*     → api:8000 (Docker 내부, 호스트에 8000 노출 안 함)
api → db:5432
```
