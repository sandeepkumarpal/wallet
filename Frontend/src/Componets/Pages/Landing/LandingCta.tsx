"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

type LandingCtaProps = {
  signedIn: boolean;
  className?: string;
};

const LandingCta = ({ signedIn, className = "" }: LandingCtaProps) => {
  const { t } = useTranslation();

  return (
    <div className={`landing-cta ${className}`.trim()}>
      {signedIn ? (
        <Link href="/dashboard" className="btn btn-primary">
          {t("landing.openApp")}
        </Link>
      ) : (
        <>
          <Link href="/signup" className="btn btn-primary">
            {t("landing.getStarted")}
          </Link>
          <Link href="/login" className="btn btn-ghost landing-cta__ghost">
            {t("landing.signIn")}
          </Link>
        </>
      )}
    </div>
  );
};

export default LandingCta;
