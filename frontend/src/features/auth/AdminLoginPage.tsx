import { useState, type SubmitEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ApiError } from "@/api/client";
import { useAdminAuth } from "@/lib/auth/useAdminAuth";
import { paths } from "@/lib/brand";

type AdminLoginErrorKey = "invalid" | "genericError" | "required";

export function AdminLoginPage() {
  const { t } = useTranslation();
  const { isSubmitting, login } = useAdminAuth();
  const [password, setPassword] = useState<string>("");
  const [errorKey, setErrorKey] = useState<AdminLoginErrorKey | null>(null);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setErrorKey(null);

    const trimmedPassword: string = password.trim();

    if (!trimmedPassword) {
      setErrorKey("required");
      return;
    }

    void (async () => {
      try {
        await login(trimmedPassword);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          setErrorKey("invalid");
          return;
        }

        setErrorKey("genericError");
      }
    })();
  };

  return (
    <section className="auth-page">
      <header className="auth-page__header">
        <h1 className="page-title">{t("admin.login.title")}</h1>
      </header>

      <form className="auth-card auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="admin-password">
            {t("admin.login.passwordLabel")}
          </label>
          <input
            id="admin-password"
            className="auth-field__input"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder={t("admin.login.passwordPlaceholder")}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            disabled={isSubmitting}
            required
          />
        </div>

        {errorKey ? (
          <p className="auth-form__error" role="alert">
            {t(`admin.login.errors.${errorKey}`)}
          </p>
        ) : null}

        <button
          className="auth-button auth-button--primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("admin.login.submitting") : t("admin.login.submit")}
        </button>
      </form>

      <Link className="text-link" to={paths.home}>
        {t("common.backHome")}
      </Link>
    </section>
  );
}
