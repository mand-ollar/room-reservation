import { useTranslation } from "react-i18next";

import { ReservationLayout } from "@/features/reservation/ReservationLayout";

export function AdminReservationsPage() {
  const { t } = useTranslation();

  return (
    <ReservationLayout
      title={t("admin.entry.reservations")}
      mode="admin"
    />
  );
}
