"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/Componets/Common/LanguageSwitcher/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";

type LandingNavProps = {
  signedIn: boolean;
};

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M5 19.5c1.6-3.2 4-4.8 7-4.8s5.4 1.6 7 4.8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
    <path
      d="M10 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M15 8l4 4-4 4M10 12h9"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LandingNav = ({ signedIn }: LandingNavProps) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const router = useRouter();

  const onLogout = () => {
    logout();
    router.refresh();
  };

  return (
    <header className="landing-nav">
      <span className="landing-nav__brand">{t("common.appName")}</span>

      <div className="landing-nav__actions">
        <div className="landing-nav__desktop">
          <LanguageSwitcher compact />
          {signedIn ? (
            <Link href="/dashboard" className="btn btn-primary landing-nav__cta">
              {t("landing.openApp")}
            </Link>
          ) : (
            <Link href="/login" className="btn btn-ghost landing-nav__cta">
              {t("landing.signIn")}
            </Link>
          )}
        </div>

        <div className="landing-nav__mobile">
          <LanguageSwitcher icon />
          {signedIn ? (
            <button
              type="button"
              className="landing-nav__icon-btn"
              onClick={onLogout}
              aria-label={t("common.logOut")}
            >
              <LogoutIcon />
            </button>
          ) : (
            <Link
              href="/login"
              className="landing-nav__icon-btn"
              aria-label={t("landing.signIn")}
            >
              <UserIcon />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default LandingNav;
