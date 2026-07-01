import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { HeaderMenu } from "@/components/HeaderMenu";
import { APP_BRAND_HEADER, paths } from "@/lib/brand";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="app-header__brand" to={paths.home}>
          {APP_BRAND_HEADER}
        </Link>
        <HeaderMenu />
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
