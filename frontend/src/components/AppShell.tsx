import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { HeaderMenu } from "@/components/HeaderMenu";
import { useAdminAuth } from "@/lib/auth/useAdminAuth";
import { APP_BRAND_HEADER, paths } from "@/lib/brand";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation();
  const { isAdmin, isInitializing } = useAdminAuth();
  const showAdminBadge: boolean = !isInitializing && isAdmin;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__start">
          <Link className="app-header__brand" to={paths.home}>
            {APP_BRAND_HEADER}
          </Link>
          {showAdminBadge ? (
            <span className="app-header__badge">{t("admin.badge")}</span>
          ) : null}
        </div>
        <HeaderMenu />
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
