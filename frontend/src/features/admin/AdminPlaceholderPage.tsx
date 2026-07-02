import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { paths } from "@/lib/brand";

type AdminPlaceholderPageProps = {
  titleKey: string;
};

export function AdminPlaceholderPage({ titleKey }: AdminPlaceholderPageProps) {
  const { t } = useTranslation();

  return (
    <section className="placeholder-page">
      <h1 className="page-title">{t(titleKey)}</h1>
      <p className="page-subtitle">{t("placeholder.comingSoon")}</p>
      <Link className="text-link" to={paths.home}>
        {t("admin.backToMenu")}
      </Link>
    </section>
  );
}
