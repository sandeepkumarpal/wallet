"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

const LandingFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="landing-footer">
      <div className="landing-footer__brand">
        <strong>{t("common.appName")}</strong>
        <span>{t("landing.footerNote")}</span>
      </div>
      <div className="landing-footer__links">
        <Link href="/signup">{t("landing.getStarted")}</Link>
        <Link href="/login">{t("landing.signIn")}</Link>
        <a href="#mobile-apps">{t("landing.appsLink")}</a>
      </div>
    </footer>
  );
};

export default LandingFooter;
