import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import { AdminPlaceholderPage } from "@/features/admin/AdminPlaceholderPage";
import { AdminReservationsPage } from "@/features/admin/AdminReservationsPage";
import { AdminRootPage } from "@/features/admin/AdminRootPage";
import { RequireAdmin } from "@/features/admin/RequireAdmin";
import { UserLoginPage } from "@/features/auth/UserLoginPage";
import { HomePage } from "@/features/home/HomePage";
import { PublicBrowsePage } from "@/features/public/PublicBrowsePage";
import { paths } from "@/lib/brand";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path={paths.home} element={<HomePage />} />
          <Route path={paths.browse} element={<PublicBrowsePage />} />
          <Route path={paths.login} element={<UserLoginPage />} />
          <Route path={paths.admin} element={<AdminRootPage />} />
          <Route
            path={paths.adminReservations}
            element={
              <RequireAdmin>
                <AdminReservationsPage />
              </RequireAdmin>
            }
          />
          <Route
            path={paths.adminPassword}
            element={
              <RequireAdmin>
                <AdminPlaceholderPage titleKey="admin.entry.password" />
              </RequireAdmin>
            }
          />
          <Route
            path={paths.adminApprovals}
            element={
              <RequireAdmin>
                <AdminPlaceholderPage titleKey="admin.entry.approvals" />
              </RequireAdmin>
            }
          />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
