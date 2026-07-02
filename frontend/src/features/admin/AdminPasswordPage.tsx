import { useState, type SubmitEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import {
  changeAdminPassword,
  MIN_ADMIN_PASSWORD_LENGTH,
} from "@/api/auth";
import { ApiError } from "@/api/client";
import { getStoredAdminTokens } from "@/lib/auth/adminStorage";
import { paths } from "@/lib/brand";

type AdminPasswordErrorKey =
  | "required"
  | "mismatch"
  | "tooShort"
  | "sameAsCurrent"
  | "invalidCurrent"
  | "genericError";

export function AdminPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorKey, setErrorKey] = useState<AdminPasswordErrorKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const clearForm = (): void => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setErrorKey(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorKey("required");
      return;
    }

    if (newPassword.length < MIN_ADMIN_PASSWORD_LENGTH) {
      setErrorKey("tooShort");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorKey("mismatch");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorKey("sameAsCurrent");
      return;
    }

    const tokens = getStoredAdminTokens();
    if (!tokens) {
      setErrorKey("genericError");
      return;
    }

    setIsSubmitting(true);

    void changeAdminPassword(tokens.accessToken, {
      current_password: currentPassword,
      new_password: newPassword,
    })
      .then(() => {
        clearForm();
        navigate(paths.home, {
          replace: true,
          state: { passwordChanged: true },
        });
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError) {
          if (error.status === 401) {
            setErrorKey("invalidCurrent");
            return;
          }
          if (error.status === 400) {
            setErrorKey("tooShort");
            return;
          }
        }

        setErrorKey("genericError");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <section className="auth-page">
      <header className="auth-page__header">
        <h1 className="page-title">{t("admin.password.title")}</h1>
        <p className="auth-page__status">{t("admin.password.description")}</p>
      </header>

      <form className="auth-card auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="admin-current-password">
            {t("admin.password.currentLabel")}
          </label>
          <input
            id="admin-current-password"
            className="auth-field__input"
            type="password"
            name="current-password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
            }}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="admin-new-password">
            {t("admin.password.newLabel")}
          </label>
          <input
            id="admin-new-password"
            className="auth-field__input"
            type="password"
            name="new-password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
            }}
            disabled={isSubmitting}
            required
          />
          <p className="auth-field__hint">{t("admin.password.requirements")}</p>
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="admin-confirm-password">
            {t("admin.password.confirmLabel")}
          </label>
          <input
            id="admin-confirm-password"
            className="auth-field__input"
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
            }}
            disabled={isSubmitting}
            required
          />
        </div>

        {errorKey ? (
          <p className="auth-form__error" role="alert">
            {t(`admin.password.errors.${errorKey}`, {
              minLength: MIN_ADMIN_PASSWORD_LENGTH,
            })}
          </p>
        ) : null}

        <button
          className="auth-button auth-button--primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t("admin.password.submitting")
            : t("admin.password.submit")}
        </button>
      </form>

      <Link className="text-link" to={paths.home}>
        {t("admin.backToMenu")}
      </Link>
    </section>
  );
}
