"use client";

import { useTranslation } from "react-i18next";

const LandingSteps = () => {
  const { t } = useTranslation();

  const steps = [
    { title: t("landing.step1Title"), sub: t("landing.step1Sub") },
    { title: t("landing.step2Title"), sub: t("landing.step2Sub") },
    { title: t("landing.step3Title"), sub: t("landing.step3Sub") },
  ];

  return (
    <section className="landing-section landing-section--steps">
      <div className="landing-section__inner landing-section__inner--wide">
        <h2>{t("landing.stepsTitle")}</h2>
        <p className="landing-section__lead">{t("landing.stepsSub")}</p>
        <ol className="landing-steps">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.title}</strong>
              <p>{step.sub}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default LandingSteps;
