"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { getErrorMessage, useAuth } from "../../../context/AuthContext";
import PasswordField from "../../Common/PasswordField/PasswordField";
import FieldError from "../../Common/FieldError/FieldError";
import LanguageSwitcher from "../../Common/LanguageSwitcher/LanguageSwitcher";
import {
  createLoginSchema,
  type LoginFormValues,
} from "../../../validation/schemas";
import "./Auth.scss";

const Login = () => {
  const { t, i18n } = useTranslation();
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(() => createLoginSchema(t), [t, i18n.language]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (!loading && user) return null;

  const onSubmit = async (values: LoginFormValues) => {
    setError("");
    setSubmitting(true);
    try {
      await login(values.email.trim(), values.password);
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, t("login.failed")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__visual" aria-hidden>
        <div className="auth-page__glow" />
        <p className="auth-page__brand">{t("common.appName")}</p>
        <h2>{t("login.brandTitle")}</h2>
        <p>{t("login.brandSub")}</p>
      </div>

      <form
        className="auth-page__card panel"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="auth-page__card-top">
          <LanguageSwitcher compact />
        </div>
        <h1>{t("login.title")}</h1>
        <p className="auth-page__sub">{t("login.subtitle")}</p>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label htmlFor="email">{t("login.email")}</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={errors.email ? "is-invalid" : undefined}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <PasswordField
          id="password"
          label={t("login.password")}
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? t("login.submitting") : t("login.submit")}
        </button>

        <p className="auth-page__switch">
          {t("login.newHere")}{" "}
          <Link href="/signup">{t("login.createAccount")}</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
