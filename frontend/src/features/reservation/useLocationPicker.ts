import { useEffect, useMemo, useState } from "react";

import { fetchBuildings, fetchSpaces } from "@/api/buildings";
import { ApiError } from "@/api/client";
import type { BuildingResponse, SpaceResponse } from "@/api/types";

import {
  getSortedFloors,
  type LocationPickerView,
} from "./locationPickerUtils";

type UseLocationPickerResult = {
  buildings: BuildingResponse[];
  spaces: SpaceResponse[];
  floors: number[];
  view: LocationPickerView;
  selectedBuildingId: string | null;
  selectedFloor: number | null;
  selectedSpaceId: string | null;
  isLoadingBuildings: boolean;
  isLoadingSpaces: boolean;
  errorKey: "loadBuildings" | "loadSpaces" | null;
  selectBuilding: (buildingId: string) => void;
  selectFloor: (floor: number) => void;
  selectSpace: (spaceId: string) => void;
  goToBuildings: () => void;
  goToFloors: () => void;
};

export function useLocationPicker(
  onSpaceSelect?: (spaceId: string | null) => void,
): UseLocationPickerResult {
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [spaces, setSpaces] = useState<SpaceResponse[]>([]);
  const [view, setView] = useState<LocationPickerView>("buildings");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null,
  );
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState<boolean>(true);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState<boolean>(false);
  const [errorKey, setErrorKey] = useState<
    "loadBuildings" | "loadSpaces" | null
  >(null);

  const floors: number[] = useMemo(() => getSortedFloors(spaces), [spaces]);

  useEffect(() => {
    let active: boolean = true;

    setIsLoadingBuildings(true);
    setErrorKey(null);

    void fetchBuildings()
      .then((data: BuildingResponse[]) => {
        if (!active) {
          return;
        }
        setBuildings(data);
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        if (error instanceof ApiError) {
          setErrorKey("loadBuildings");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingBuildings(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedBuildingId) {
      return;
    }

    let active: boolean = true;

    setIsLoadingSpaces(true);
    setErrorKey(null);

    void fetchSpaces(selectedBuildingId)
      .then((data: SpaceResponse[]) => {
        if (!active) {
          return;
        }
        setSpaces(data);
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        if (error instanceof ApiError) {
          setErrorKey("loadSpaces");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingSpaces(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedBuildingId]);

  const clearSpaceSelection = (): void => {
    setSelectedSpaceId(null);
    onSpaceSelect?.(null);
  };

  const selectBuilding = (buildingId: string): void => {
    setSelectedFloor(null);
    clearSpaceSelection();
    setView("floors");

    if (buildingId !== selectedBuildingId) {
      setSpaces([]);
      setSelectedBuildingId(buildingId);
    }
  };

  const selectFloor = (floor: number): void => {
    setSelectedFloor(floor);
    clearSpaceSelection();
    setView("spaces");
  };

  const selectSpace = (spaceId: string): void => {
    if (spaceId === selectedSpaceId) {
      return;
    }

    setSelectedSpaceId(spaceId);
    onSpaceSelect?.(spaceId);
  };

  const goToBuildings = (): void => {
    setSelectedFloor(null);
    clearSpaceSelection();
    setView("buildings");
  };

  const goToFloors = (): void => {
    setSelectedFloor(null);
    clearSpaceSelection();
    setView("floors");
  };

  return {
    buildings,
    spaces,
    floors,
    view,
    selectedBuildingId,
    selectedFloor,
    selectedSpaceId,
    isLoadingBuildings,
    isLoadingSpaces,
    errorKey,
    selectBuilding,
    selectFloor,
    selectSpace,
    goToBuildings,
    goToFloors,
  };
}
