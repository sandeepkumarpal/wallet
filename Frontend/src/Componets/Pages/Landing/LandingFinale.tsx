"use client";

import { useTranslation } from "react-i18next";
import LandingCta from "./LandingCta";

type LandingFinaleProps = {
  signedIn: boolean;
};

const LandingFinale = ({ signedIn }: LandingFinaleProps) => {
  const { t } = useTranslation();

  return (
    <section className="landing-finale">
      <div className="landing-finale__inner">
        <h2>{t("landing.finaleTitle")}</h2>
        <p>{t("landing.finaleSub")}</p>
        <LandingCta signedIn={signedIn} />
      </div>
    </section>
  );
};

export default LandingFinale;
