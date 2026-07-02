import type { SpaceResponse } from "@/api/types";

export type LocationPickerView = "buildings" | "floors" | "spaces";

export const getSortedFloors = (spaces: SpaceResponse[]): number[] => {
  const floorSet: Set<number> = new Set(spaces.map((space) => space.floor));
  return [...floorSet].sort((a, b) => a - b);
};

export const getSpacesOnFloor = (
  spaces: SpaceResponse[],
  floor: number,
): SpaceResponse[] => {
  return spaces.filter((space) => space.floor === floor);
};
