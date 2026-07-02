import { useTranslation } from "react-i18next";

import { ReservationLayout } from "@/features/reservation/ReservationLayout";

export function PublicBrowsePage() {
  const { t } = useTranslation();

  return <ReservationLayout title={t("home.entry.public")} />;
}
