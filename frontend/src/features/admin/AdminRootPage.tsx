import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import { AdminLoginPage } from "@/features/auth/AdminLoginPage";
import { useAdminAuth } from "@/lib/auth/useAdminAuth";
import { paths } from "@/lib/brand";

export function AdminRootPage() {
  const { t } = useTranslation();
  const { isAdmin, isInitializing } = useAdminAuth();

  if (isInitializing) {
    return (
      <section className="auth-page">
        <p className="auth-page__status">{t("admin.login.loading")}</p>
      </section>
    );
  }

  if (isAdmin) {
    return <Navigate to={paths.home} replace />;
  }

  return <AdminLoginPage />;
}
