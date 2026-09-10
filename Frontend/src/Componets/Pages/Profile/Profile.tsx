"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { useAuth, getErrorMessage } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { api } from "../../../utils/api";
import { API_URLS } from "../../../utils/Apiurls";
import { formatINR } from "../../../types/finance";
import ConfirmModal from "../../Common/ConfirmModal/ConfirmModal";
import { ProfileSkeleton } from "../../Common/PageSkeleton/PageSkeleton";
import { usePageGsap } from "../../../hooks/usePageGsap";
import PasswordField from "../../Common/PasswordField/PasswordField";
import LanguageSwitcher from "../../Common/LanguageSwitcher/LanguageSwitcher";
import {
  createChangePasswordSchema,
  type ChangePasswordFormValues,
} from "../../../validation/schemas";
import "./Profile.scss";

const PROFILE_TARGETS = [
  ".profile-page__card",
  ".profile-page__prefs",
  ".profile-page__form",
] as const;

const Profile = () => {
  const { t, i18n } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const { user, logout, refreshUser, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const schema = useMemo(
    () => createChangePasswordSchema(t),
    [t, i18n.language]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  usePageGsap({
    rootRef,
    path: "/profile",
    enabled: Boolean(user) && !loading,
    targets: PROFILE_TARGETS,
  });

  const onChangePassword = async (values: ChangePasswordFormValues) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post(API_URLS.CHANGE_PASSWORD, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setSuccess(t("profile.passwordUpdated"));
      reset({ currentPassword: "", newPassword: "" });
      await refreshUser();
    } catch (err) {
      setError(getErrorMessage(err, t("profile.passwordFailed")));
    } finally {
      setSaving(false);
    }
  };

  const onLogout = () => {
    logout();
    setConfirmLogout(false);
    router.push("/login");
  };

  const modeLabel = theme === "dark" ? t("profile.dark") : t("profile.light");

  return (
    <div className="profile-page" ref={rootRef}>
      <div className="page-head">
        <div>
          <h1>{t("profile.title")}</h1>
          <p>{t("profile.subtitle")}</p>
        </div>
      </div>

      {loading && !user ? (
        <ProfileSkeleton />
      ) : (
        <>
          <section className="panel profile-page__card">
            <div className="profile-page__avatar" aria-hidden>
              {(user?.fullName || "W").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>{user?.fullName}</h2>
              <p>{user?.email}</p>
              <p className="profile-page__budget">
                {t("profile.monthlyBudget", {
                  amount: formatINR(user?.monthlyBudget || 0),
                })}
              </p>
            </div>
          </section>

          <section className="panel profile-page__prefs">
            <h2>{t("profile.preferences")}</h2>
            <div className="profile-page__pref-row">
              <div>
                <strong>{t("common.language")}</strong>
                <p>{t("profile.languageHint")}</p>
              </div>
              <LanguageSwitcher />
            </div>
            <div className="profile-page__pref-row">
              <div>
                <strong>{t("profile.appearance")}</strong>
                <p>{t("profile.appearanceHint", { mode: modeLabel })}</p>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={toggleTheme}
              >
                {t("profile.switchTo", {
                  mode:
                    theme === "dark" ? t("profile.light") : t("profile.dark"),
                })}
              </button>
            </div>
            <div className="profile-page__pref-row">
              <div>
                <strong>{t("profile.alerts")}</strong>
                <p>{t("profile.alertsHint")}</p>
              </div>
            </div>
          </section>

          <form
            className="panel profile-page__form"
            onSubmit={handleSubmit(onChangePassword)}
            noValidate
          >
            <h2>{t("profile.changePassword")}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <PasswordField
              id="current"
              label={t("profile.currentPassword")}
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
            />
            <PasswordField
              id="next"
              label={t("profile.newPassword")}
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving
                ? t("profile.updatingPassword")
                : t("profile.updatePassword")}
            </button>
          </form>

          <button
            type="button"
            className="btn btn-ghost profile-page__logout"
            onClick={() => setConfirmLogout(true)}
          >
            {t("common.logOut")}
          </button>
        </>
      )}

      <ConfirmModal
        open={confirmLogout}
        title={t("nav.logoutTitle")}
        message={t("nav.logoutMessage")}
        confirmLabel={t("common.logOut")}
        danger
        onConfirm={onLogout}
        onClose={() => setConfirmLogout(false)}
      />
    </div>
  );
};

export default Profile;
