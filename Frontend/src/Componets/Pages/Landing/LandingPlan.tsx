"use client";

import { useTranslation } from "react-i18next";

const LandingPlan = () => {
  const { t } = useTranslation();

  return (
    <section className="landing-section landing-section--plan">
      <div className="landing-section__inner landing-section__inner--wide">
        <div className="landing-section__text">
          <h2>{t("landing.planTitle")}</h2>
          <p>{t("landing.planSub")}</p>
        </div>
        <div className="landing-pace" aria-hidden>
          <span className="landing-pace__label">{t("landing.paceLabel")}</span>
          <strong>68%</strong>
          <div className="landing-pace__bar">
            <span />
          </div>
          <em>{t("landing.paceHint")}</em>
        </div>
      </div>
    </section>
  );
};

export default LandingPlan;
