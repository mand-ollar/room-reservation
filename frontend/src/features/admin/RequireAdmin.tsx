import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import { useAdminAuth } from "@/lib/auth/useAdminAuth";
import { paths } from "@/lib/brand";

type RequireAdminProps = {
  children: ReactNode;
};

export function RequireAdmin({ children }: RequireAdminProps) {
  const { t } = useTranslation();
  const { isAdmin, isInitializing } = useAdminAuth();

  if (isInitializing) {
    return (
      <section className="auth-page">
        <p className="auth-page__status">{t("admin.login.loading")}</p>
      </section>
    );
  }

  if (!isAdmin) {
    return <Navigate to={paths.admin} replace />;
  }

  return children;
}
