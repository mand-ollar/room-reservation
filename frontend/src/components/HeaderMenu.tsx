import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useTranslation } from "react-i18next";

import { useAppLanguage } from "@/lib/locale";
import { useAuth } from "@/lib/auth/useAuth";
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

const blurIfTouchUp = (event: ReactPointerEvent<HTMLElement>): void => {
  if (isTouchLikePointer(event.pointerType)) {
    event.currentTarget.blur();
  }
};

export function HeaderMenu() {
  const { t } = useTranslation();
  const menuId: string = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [activeSubmenu, setActiveSubmenu] = useState<SubmenuId | null>(null);

  const { language, setLanguage } = useAppLanguage();
  const { themePreference, setThemePreference } = useTheme();
  const { user, isInitializing, logout } = useAuth();

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

  const closeSubmenu = (): void => {
    setActiveSubmenu(null);
  };

  const handleSubmenuPointerEnter = (
    event: ReactPointerEvent<HTMLElement>,
    submenuId: SubmenuId,
  ): void => {
    if (isTouchLikePointer(event.pointerType) || !canHover()) {
      return;
    }
    openSubmenu(submenuId);
  };

  const handleNonSubmenuPointerEnter = (
    event: ReactPointerEvent<HTMLElement>,
  ): void => {
    if (isTouchLikePointer(event.pointerType) || !canHover()) {
      return;
    }
    closeSubmenu();
  };

  const handleSubmenuPointerLeave = (
    event: ReactPointerEvent<HTMLElement>,
    submenuId: SubmenuId,
  ): void => {
    if (isTouchLikePointer(event.pointerType) || !canHover()) {
      return;
    }

    const relatedTarget: EventTarget | null = event.relatedTarget;
    if (
      relatedTarget instanceof Node &&
      event.currentTarget.contains(relatedTarget)
    ) {
      return;
    }

    setActiveSubmenu((current: SubmenuId | null) =>
      current === submenuId ? null : current,
    );
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
        handleSubmenuPointerEnter(event, submenuId);
      }}
      onPointerLeave={(event) => {
        handleSubmenuPointerLeave(event, submenuId);
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
        onPointerUp={blurIfTouchUp}
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
                closeMenu();
              }}
              onPointerUp={blurIfTouchUp}
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
        onPointerUp={blurIfTouchUp}
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
          {!isInitializing && user ? (
            <div
              className="header-menu__footer"
              onPointerEnter={handleNonSubmenuPointerEnter}
            >
              <div
                className="header-menu__divider"
                role="separator"
                aria-hidden="true"
              />
              <button
                type="button"
                role="menuitem"
                className="header-menu__action"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                onPointerUp={blurIfTouchUp}
              >
                {t("auth.login.logout")}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
