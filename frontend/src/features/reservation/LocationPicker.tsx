import { useTranslation } from "react-i18next";

import type { BuildingResponse, SpaceResponse } from "@/api/types";
import { getLocalizedName, useAppLocale } from "@/lib/locale";

import { getSpacesOnFloor } from "./locationPickerUtils";
import { useLocationPicker } from "./useLocationPicker";

type LocationPickerProps = {
  selectedSpaceId?: string | null;
  onSpaceSelect?: (spaceId: string | null) => void;
};

type PickerListItemProps = {
  label: string;
  sublabel?: string;
  isSelected?: boolean;
  onClick: () => void;
};

const PickerListItem = ({
  label,
  sublabel,
  isSelected = false,
  onClick,
}: PickerListItemProps) => {
  return (
    <button
      type="button"
      className={`location-picker__item${isSelected ? " location-picker__item--selected" : ""}`}
      onClick={onClick}
      aria-current={isSelected ? "true" : undefined}
    >
      <span className="location-picker__item-content">
        <span className="location-picker__item-label">{label}</span>
        {sublabel ? (
          <span className="location-picker__item-sublabel">{sublabel}</span>
        ) : null}
      </span>
      <span className="location-picker__item-chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="location-picker__item-chevron-svg">
          <path
            d="M9 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
          />
        </svg>
      </span>
    </button>
  );
};

export function LocationPicker({
  selectedSpaceId: controlledSpaceId,
  onSpaceSelect,
}: LocationPickerProps) {
  const { t } = useTranslation();
  const locale = useAppLocale();
  const {
    buildings,
    spaces,
    floors,
    view,
    selectedBuildingId,
    selectedFloor,
    selectedSpaceId: internalSpaceId,
    isLoadingBuildings,
    isLoadingSpaces,
    errorKey,
    selectBuilding,
    selectFloor,
    selectSpace,
    goToBuildings,
    goToFloors,
  } = useLocationPicker(onSpaceSelect);

  const activeSpaceId: string | null =
    controlledSpaceId ?? internalSpaceId ?? null;

  const selectedBuilding: BuildingResponse | undefined = buildings.find(
    (building) => building.id === selectedBuildingId,
  );

  const formatFloor = (floor: number): string =>
    t("reservation.location.floorLabel", { floor });

  const spacesOnFloor: SpaceResponse[] =
    selectedFloor !== null ? getSpacesOnFloor(spaces, selectedFloor) : [];

  const headingKey: string =
    view === "buildings"
      ? "reservation.location.buildings"
      : view === "floors"
        ? "reservation.location.floors"
        : "reservation.location.spaces";

  const renderBuildingList = () => {
    if (isLoadingBuildings) {
      return (
        <p className="location-picker__status">{t("reservation.location.loading")}</p>
      );
    }

    if (errorKey === "loadBuildings") {
      return (
        <p className="location-picker__error" role="alert">
          {t("reservation.location.errors.loadBuildings")}
        </p>
      );
    }

    if (buildings.length === 0) {
      return (
        <p className="location-picker__status">
          {t("reservation.location.emptyBuildings")}
        </p>
      );
    }

    return (
      <ul className="location-picker__list">
        {buildings.map((building) => (
          <li key={building.id}>
            <PickerListItem
              label={getLocalizedName(building.names, locale)}
              isSelected={building.id === selectedBuildingId}
              onClick={() => {
                selectBuilding(building.id);
              }}
            />
          </li>
        ))}
      </ul>
    );
  };

  const renderFloorList = () => {
    if (isLoadingSpaces) {
      return (
        <p className="location-picker__status">{t("reservation.location.loading")}</p>
      );
    }

    if (errorKey === "loadSpaces") {
      return (
        <p className="location-picker__error" role="alert">
          {t("reservation.location.errors.loadSpaces")}
        </p>
      );
    }

    if (floors.length === 0) {
      return (
        <p className="location-picker__status">
          {t("reservation.location.emptyFloors")}
        </p>
      );
    }

    return (
      <ul className="location-picker__list">
        {floors.map((floor) => (
          <li key={floor}>
            <PickerListItem
              label={formatFloor(floor)}
              sublabel={t("reservation.location.spaceCount", {
                count: getSpacesOnFloor(spaces, floor).length,
              })}
              onClick={() => {
                selectFloor(floor);
              }}
            />
          </li>
        ))}
      </ul>
    );
  };

  const renderSpaceList = () => {
    if (isLoadingSpaces) {
      return (
        <p className="location-picker__status">{t("reservation.location.loading")}</p>
      );
    }

    if (spacesOnFloor.length === 0) {
      return (
        <p className="location-picker__status">
          {t("reservation.location.emptySpaces")}
        </p>
      );
    }

    return (
      <ul className="location-picker__list">
        {spacesOnFloor.map((space) => (
          <li key={space.id}>
            <PickerListItem
              label={getLocalizedName(space.names, locale)}
              isSelected={activeSpaceId === space.id}
              onClick={() => {
                selectSpace(space.id);
              }}
            />
          </li>
        ))}
      </ul>
    );
  };

  const hasPath: boolean =
    view !== "buildings" && selectedBuilding !== undefined;

  const buildingName: string | null = selectedBuilding
    ? getLocalizedName(selectedBuilding.names, locale)
    : null;

  return (
    <div className="location-picker">
      <header className="location-picker__header">
        <nav
          className="location-picker__path"
          aria-label={t("reservation.location.title")}
        >
          {hasPath && buildingName ? (
            <>
              <button
                type="button"
                className="location-picker__path-item"
                onClick={goToBuildings}
              >
                {buildingName}
              </button>

              {view === "spaces" && selectedFloor !== null ? (
                <>
                  <span className="location-picker__path-separator" aria-hidden="true">
                    /
                  </span>
                  <button
                    type="button"
                    className="location-picker__path-item"
                    onClick={goToFloors}
                  >
                    {formatFloor(selectedFloor)}
                  </button>
                </>
              ) : null}
            </>
          ) : (
            <span className="location-picker__path-placeholder">
              {t("reservation.location.pathPlaceholder")}
            </span>
          )}
        </nav>

        <h3 className="location-picker__heading">{t(headingKey)}</h3>
      </header>

      <div className="location-picker__body">
        {view === "buildings" ? renderBuildingList() : null}
        {view === "floors" ? renderFloorList() : null}
        {view === "spaces" ? renderSpaceList() : null}
      </div>
    </div>
  );
}
