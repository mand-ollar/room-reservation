import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ReservationLayout } from "@/features/reservation/ReservationLayout";
import { useAuth } from "@/lib/auth/useAuth";
import { paths } from "@/lib/brand";

export function PublicBrowsePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
            onClick={() => {
              navigate(paths.home, { replace: true });
              logout();
            }}
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
