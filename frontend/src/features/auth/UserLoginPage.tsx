import { useState, type SubmitEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { ApiError } from "@/api/client";
import { useAuth } from "@/lib/auth/useAuth";
import { paths } from "@/lib/brand";

type LoginErrorKey = "nameMismatch" | "genericError" | "required";

const PHONE_DIGIT_LENGTH = 11;
const PHONE_FORMATTED_LENGTH = 13;

const extractPhoneDigits = (value: string): string =>
  value.replace(/\D/g, "").slice(0, PHONE_DIGIT_LENGTH);

const formatPhoneDisplay = (digits: string): string => {
  const areaCode: string = digits.slice(0, 3);
  const middle: string = digits.slice(3, 7);
  const last: string = digits.slice(7, PHONE_DIGIT_LENGTH);

  if (digits.length <= 3) {
    return areaCode;
  }

  if (digits.length <= 7) {
    return `${areaCode}-${middle}`;
  }

  return `${areaCode}-${middle}-${last}`;
};

export function UserLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isInitializing, isSubmitting, login } = useAuth();
  const [name, setName] = useState<string>("");
  const [phoneDigits, setPhoneDigits] = useState<string>("");
  const [errorKey, setErrorKey] = useState<LoginErrorKey | null>(null);

  const handlePhoneChange = (value: string) => {
    setPhoneDigits(extractPhoneDigits(value));
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setErrorKey(null);

    const trimmedName: string = name.trim();

    if (!trimmedName || phoneDigits.length !== PHONE_DIGIT_LENGTH) {
      setErrorKey("required");
      return;
    }

    void (async () => {
      try {
        await login(trimmedName, phoneDigits);
        navigate(paths.home);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          setErrorKey("nameMismatch");
          return;
        }

        setErrorKey("genericError");
      }
    })();
  };

  if (isInitializing) {
    return (
      <section className="auth-page">
        <p className="auth-page__status">{t("auth.login.loading")}</p>
      </section>
    );
  }

  if (user) {
    return <Navigate to={paths.home} replace />;
  }

  return (
    <section className="auth-page">
      <header className="auth-page__header">
        <h1 className="page-title">{t("auth.login.title")}</h1>
      </header>

      <form className="auth-card auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="login-name">
            {t("auth.login.nameLabel")}
          </label>
          <input
            id="login-name"
            className="auth-field__input"
            type="text"
            name="name"
            autoComplete="name"
            placeholder={t("auth.login.namePlaceholder")}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="login-phone">
            {t("auth.login.phoneLabel")}
          </label>
          <input
            id="login-phone"
            className="auth-field__input auth-field__input--phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            placeholder={t("auth.login.phonePlaceholder")}
            maxLength={PHONE_FORMATTED_LENGTH}
            value={formatPhoneDisplay(phoneDigits)}
            onChange={(event) => {
              handlePhoneChange(event.target.value);
            }}
            disabled={isSubmitting}
            required
          />
        </div>

        {errorKey ? (
          <p className="auth-form__error" role="alert">
            {t(`auth.login.errors.${errorKey}`)}
          </p>
        ) : null}

        <button
          className="auth-button auth-button--primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
        </button>
      </form>

      <Link className="text-link" to={paths.home}>
        {t("common.backHome")}
      </Link>
    </section>
  );
}
