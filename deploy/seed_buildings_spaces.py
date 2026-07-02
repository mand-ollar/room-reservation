#!/usr/bin/env python3
"""Seed buildings and spaces via the admin API.

Usage (Orange Pi host, nginx on :80):
    cd deploy
    API_BASE_URL=http://127.0.0.1/api \\
    ADMIN_PASSWORD=<your-admin-password> \\
    uv run --project ../backend python seed_buildings_spaces.py

Usage (inside api container):
    API_BASE_URL=http://127.0.0.1:8000 \\
    ADMIN_PASSWORD=<your-admin-password> \\
    uv run python scripts/seed_buildings_spaces.py
"""

from __future__ import annotations

import asyncio
import os
import sys
from dataclasses import dataclass

import httpx


@dataclass(frozen=True)
class SpaceSeed:
    name_ko: str
    name_en: str
    floor: int


@dataclass(frozen=True)
class BuildingSeed:
    name_ko: str
    name_en: str
    spaces: tuple[SpaceSeed, ...]


BUILDING_SEEDS: tuple[BuildingSeed, ...] = (
    BuildingSeed(
        name_ko="본당",
        name_en="MAIN",
        spaces=(
            SpaceSeed(name_ko="본당", name_en="MAIN HALL", floor=1),
            SpaceSeed(name_ko="새가족부실", name_en="NEWCOMER'S ROOM", floor=1),
            SpaceSeed(name_ko="코이노니아", name_en="KOINONIA", floor=2),
            SpaceSeed(name_ko="식당", name_en="CAFETERIA", floor=2),
            SpaceSeed(name_ko="헤세드", name_en="HESED", floor=3),
            SpaceSeed(name_ko="사랑룸", name_en="LOVE", floor=3),
            SpaceSeed(name_ko="온유룸", name_en="MEEK", floor=3),
            SpaceSeed(name_ko="새가족부실", name_en="NEWCOMER'S ROOM", floor=3),
        ),
    ),
    BuildingSeed(
        name_ko="비전랜드",
        name_en="VISION LAND",
        spaces=(
            SpaceSeed(name_ko="중등부", name_en="MID", floor=1),
            SpaceSeed(name_ko="유초등부", name_en="ELEM", floor=1),
            SpaceSeed(name_ko="영아부-안쪽", name_en="BABY-INSIDE", floor=2),
            SpaceSeed(name_ko="영아부-바깥쪽", name_en="BABY-OUTSIDE", floor=2),
            SpaceSeed(name_ko="사랑부", name_en="SPECIAL", floor=2),
            SpaceSeed(name_ko="도서관", name_en="LIBRARY", floor=2),
        ),
    ),
    BuildingSeed(
        name_ko="드림랜드",
        name_en="DREAM LAND",
        spaces=(
            SpaceSeed(name_ko="유치부", name_en="KINDER", floor=1),
            SpaceSeed(name_ko="고등부", name_en="HIGH", floor=2),
            SpaceSeed(name_ko="옥상", name_en="ROOF", floor=3),
        ),
    ),
)


async def _admin_token(*, client: httpx.AsyncClient, password: str) -> str:
    response: httpx.Response = await client.post(
        url="/auth/admin/login",
        json={"password": password},
    )
    response.raise_for_status()
    token: str = response.json()["access_token"]
    return token


async def _create_building(
    *,
    client: httpx.AsyncClient,
    token: str,
    seed: BuildingSeed,
) -> str:
    response: httpx.Response = await client.post(
        url="/buildings",
        headers={"Authorization": f"Bearer {token}"},
        json={"names": {"ko": seed.name_ko, "en": seed.name_en}},
    )
    response.raise_for_status()
    building_id: str = response.json()["id"]
    return building_id


async def _create_space(
    *,
    client: httpx.AsyncClient,
    token: str,
    building_id: str,
    seed: SpaceSeed,
) -> None:
    response: httpx.Response = await client.post(
        url="/spaces",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "building_id": building_id,
            "names": {"ko": seed.name_ko, "en": seed.name_en},
            "floor": seed.floor,
        },
    )
    response.raise_for_status()


async def seed() -> None:
    base_url: str = os.environ.get("API_BASE_URL", "http://127.0.0.1/api")
    password: str = os.environ["ADMIN_PASSWORD"]

    async with httpx.AsyncClient(base_url=base_url, timeout=30.0) as client:
        token: str = await _admin_token(client=client, password=password)

        existing: httpx.Response = await client.get(url="/buildings")
        existing.raise_for_status()
        if existing.json():
            print("Buildings already exist — skipping seed. Clear DB first if you want a fresh seed.")
            return

        for building_seed in BUILDING_SEEDS:
            building_id: str = await _create_building(
                client=client, token=token, seed=building_seed
            )
            print(f"Created building: {building_seed.name_ko} ({building_id})")
            for space_seed in building_seed.spaces:
                await _create_space(
                    client=client,
                    token=token,
                    building_id=building_id,
                    seed=space_seed,
                )
                print(f"  + {space_seed.name_ko} (floor {space_seed.floor})")
            print(f"  total {len(building_seed.spaces)} spaces")

    print("Seed complete.")


def main() -> None:
    if "ADMIN_PASSWORD" not in os.environ:
        print("Set ADMIN_PASSWORD env var.", file=sys.stderr)
        sys.exit(1)
    try:
        asyncio.run(seed())
    except httpx.HTTPError as error:
        print(f"Seed failed: {error}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
