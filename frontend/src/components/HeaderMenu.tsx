import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppLanguage } from "@/lib/locale";
import type { AppLanguage } from "@/lib/i18n/config";
import type { ThemePreference } from "@/lib/theme/storage";
import { useTheme } from "@/lib/theme/useTheme";

type MenuOption<T extends string> = {
  value: T;
  label: string;
};

type SubmenuId = "language" | "theme";

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" className="header-menu__chevron" aria-hidden="true">
    <path
      d="M15 6l-6 6 6 6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="header-menu__check" aria-hidden="true">
    <path
      d="M6 12.5 10 16.5 18 8.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const canHover = (): boolean =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const isTouchLikePointer = (pointerType: string): boolean =>
  pointerType === "touch" || pointerType === "pen";

export function HeaderMenu() {
  const { t } = useTranslation();
  const menuId: string = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [activeSubmenu, setActiveSubmenu] = useState<SubmenuId | null>(null);

  const { language, setLanguage } = useAppLanguage();
  const { themePreference, setThemePreference } = useTheme();

  const languageOptions: readonly MenuOption<AppLanguage>[] = [
    { value: "ko", label: t("settings.korean") },
    { value: "en", label: t("settings.english") },
  ];

  const themeOptions: readonly MenuOption<ThemePreference>[] = [
    { value: "light", label: t("settings.light") },
    { value: "dark", label: t("settings.dark") },
    { value: "system", label: t("settings.system") },
  ];

  const closeMenu = (): void => {
    setOpen(false);
    setActiveSubmenu(null);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      if (
        containerRef.current !== null &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleToggle = (): void => {
    if (open) {
      closeMenu();
      return;
    }
    setOpen(true);
    setActiveSubmenu(null);
  };

  const openSubmenu = (submenuId: SubmenuId): void => {
    setActiveSubmenu(submenuId);
  };

  const toggleSubmenu = (submenuId: SubmenuId): void => {
    setActiveSubmenu((current: SubmenuId | null) =>
      current === submenuId ? null : submenuId,
    );
  };

  const renderSubmenuItem = <T extends string>(
    submenuId: SubmenuId,
    label: string,
    options: readonly MenuOption<T>[],
    value: T,
    onSelect: (nextValue: T) => void,
  ) => (
    <div
      className="header-menu__item"
      onPointerEnter={(event) => {
        if (isTouchLikePointer(event.pointerType) || !canHover()) {
          return;
        }
        openSubmenu(submenuId);
      }}
    >
      <button
        type="button"
        role="menuitem"
        className={
          activeSubmenu === submenuId
            ? "header-menu__row header-menu__row--open"
            : "header-menu__row"
        }
        aria-expanded={activeSubmenu === submenuId}
        aria-haspopup="menu"
        onClick={() => {
          toggleSubmenu(submenuId);
        }}
      >
        <span>{label}</span>
        <ChevronLeft />
      </button>

      {activeSubmenu === submenuId && (
        <div className="header-menu__subpanel" role="menu">
          {options.map((option: MenuOption<T>) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              className="header-menu__suboption"
              aria-checked={value === option.value}
              onClick={() => {
                onSelect(option.value);
              }}
            >
              <span>{option.label}</span>
              {value === option.value && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="header-menu" ref={containerRef}>
      <button
        type="button"
        className="header-menu__trigger"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={t("settings.menu")}
        onClick={handleToggle}
      >
        <svg viewBox="0 0 24 24" className="header-menu__trigger-icon" aria-hidden="true">
          <circle cx="12" cy="5" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="19" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div id={menuId} className="header-menu__panel" role="menu">
          {renderSubmenuItem(
            "language",
            t("settings.language"),
            languageOptions,
            language,
            setLanguage,
          )}
          {renderSubmenuItem(
            "theme",
            t("settings.theme"),
            themeOptions,
            themePreference,
            setThemePreference,
          )}
        </div>
      )}
    </div>
  );
}
