import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import { i18n } from "@/lib/i18n/config";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>{children}</ThemeProvider>
    </I18nextProvider>
  );
}
