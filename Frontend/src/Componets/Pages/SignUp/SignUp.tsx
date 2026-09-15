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
import GoogleSignInButton from "../../Common/GoogleSignInButton/GoogleSignInButton";
import {
  createSignUpSchema,
  type SignUpFormValues,
} from "../../../validation/schemas";
import "../Login/Auth.scss";

const SignUp = () => {
  const { t, i18n } = useTranslation();
  const { register: registerUser, user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(() => createSignUpSchema(t), [t, i18n.language]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirm: "",
    },
  });

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (!loading && user) return null;

  const onSubmit = async (values: SignUpFormValues) => {
    setError("");
    setSubmitting(true);
    try {
      await registerUser(
        values.fullName.trim(),
        values.email.trim(),
        values.password
      );
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, t("signup.failed")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__visual" aria-hidden>
        <div className="auth-page__glow" />
        <p className="auth-page__brand">{t("common.appName")}</p>
        <h2>{t("signup.brandTitle")}</h2>
        <p>{t("signup.brandSub")}</p>
      </div>

      <form
        className="auth-page__card panel"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="auth-page__card-top">
          <LanguageSwitcher compact />
        </div>
        <h1>{t("signup.title")}</h1>
        <p className="auth-page__sub">{t("signup.subtitle")}</p>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label htmlFor="fullName">{t("signup.fullName")}</label>
          <input
            id="fullName"
            className={errors.fullName ? "is-invalid" : undefined}
            aria-invalid={Boolean(errors.fullName)}
            {...register("fullName")}
          />
          <FieldError message={errors.fullName?.message} />
        </div>
        <div className="field">
          <label htmlFor="email">{t("signup.email")}</label>
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
          label={t("signup.password")}
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordField
          id="confirm"
          label={t("signup.confirm")}
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register("confirm")}
        />

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? t("signup.submitting") : t("signup.submit")}
        </button>

        <GoogleSignInButton
          onSuccessNavigate={() => router.push("/dashboard")}
          onError={setError}
        />

        <p className="auth-page__switch">
          {t("signup.haveAccount")}{" "}
          <Link href="/login">{t("signup.signIn")}</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
