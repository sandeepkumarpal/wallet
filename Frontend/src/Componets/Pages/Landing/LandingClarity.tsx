"use client";

import { useTranslation } from "react-i18next";

const LandingClarity = () => {
  const { t } = useTranslation();

  return (
    <section className="landing-section landing-section--clarity">
      <div className="landing-section__inner">
        <h2>{t("landing.clarityTitle")}</h2>
        <p>{t("landing.claritySub")}</p>
      </div>
    </section>
  );
};

export default LandingClarity;
