"use client";

import { useTranslation } from "react-i18next";
import LandingCta from "./LandingCta";
import LandingHeroVisual from "./LandingHeroVisual";

type LandingHeroProps = {
  signedIn: boolean;
};

const LandingHero = ({ signedIn }: LandingHeroProps) => {
  const { t } = useTranslation();

  return (
    <section className="landing-hero" aria-label={t("common.appName")}>
      <div className="landing-hero__atmosphere" aria-hidden>
        <span className="landing-hero__beam landing-hero__beam--a" />
        <span className="landing-hero__beam landing-hero__beam--b" />
        <span className="landing-hero__grain" />
      </div>

      <div className="landing-hero__layout">
        <div className="landing-hero__copy">
          <p className="landing-hero__brand">{t("common.appName")}</p>
          <h1>{t("landing.headline")}</h1>
          <p className="landing-hero__sub">{t("landing.sub")}</p>
          <LandingCta signedIn={signedIn} className="landing-hero__cta" />
        </div>

        <LandingHeroVisual />
      </div>
    </section>
  );
};

export default LandingHero;
