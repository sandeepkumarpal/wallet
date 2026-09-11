"use client";

import { useTranslation } from "react-i18next";
import StoreBadges from "./StoreBadges";

const LandingApps = () => {
  const { t } = useTranslation();

  return (
    <section className="landing-section landing-section--apps" id="mobile-apps">
      <div className="landing-section__inner landing-section__inner--wide">
        <div className="landing-apps">
          <div className="landing-apps__copy">
            <p className="landing-apps__eyebrow">{t("landing.appsEyebrow")}</p>
            <h2>{t("landing.appsTitle")}</h2>
            <p>{t("landing.appsSub")}</p>
          </div>
          <StoreBadges />
        </div>
      </div>
    </section>
  );
};

export default LandingApps;
