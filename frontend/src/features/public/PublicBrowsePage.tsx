import { useTranslation } from "react-i18next";

import { ReservationLayout } from "@/features/reservation/ReservationLayout";
import { useAuth } from "@/lib/auth/useAuth";

export function PublicBrowsePage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const reservationLayout = (
    <ReservationLayout title={t("home.entry.reservation")} />
  );

  if (user) {
    return (
      <div className="booking-page">
        <div className="booking-page__toolbar">
          <p className="booking-page__welcome">
            {t("home.welcome", { name: user.name })}
          </p>
          <button
            className="booking-page__logout"
            type="button"
            onClick={logout}
          >
            {t("auth.login.logout")}
          </button>
        </div>

        {reservationLayout}
      </div>
    );
  }

  return reservationLayout;
}
