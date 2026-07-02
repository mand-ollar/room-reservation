import { apiFetch } from "./client";
import type { BuildingResponse, SpaceResponse } from "./types";

export async function fetchBuildings(): Promise<BuildingResponse[]> {
  return apiFetch<BuildingResponse[]>("/buildings");
}

export async function fetchSpaces(
  buildingId: string,
): Promise<SpaceResponse[]> {
  return apiFetch<SpaceResponse[]>(`/spaces?building_id=${buildingId}`);
}

export async function fetchAllSpaces(): Promise<SpaceResponse[]> {
  return apiFetch<SpaceResponse[]>("/spaces");
}
