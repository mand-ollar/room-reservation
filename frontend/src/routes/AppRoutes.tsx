import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import { AdminLoginPage } from "@/features/auth/AdminLoginPage";
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
          <Route path={paths.admin} element={<AdminLoginPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
