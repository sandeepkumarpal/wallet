"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import LanguageSwitcher from "@/Componets/Common/LanguageSwitcher/LanguageSwitcher";
import "./Landing.scss";

const PlayStoreGlyph = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
    <path
      fill="currentColor"
      d="M3.6 2.9c-.4.2-.6.6-.6 1.1v16c0 .5.2.9.6 1.1l9.7-9.1L3.6 2.9zm11.1 5.2L6.1 3.1l9.5 5.5 3.9 2.2-4.8-2.7zM6.1 20.9l8.6-5 3.9 2.2-8.6 5c-1.4.8-3.1-.2-3.9-2.2zm13.4-7.1l-3.4 1.9-4.1-2.4 4.1-2.4 3.4 1.9c.7.4.7 1.4 0 1.9z"
    />
  </svg>
);

const AppStoreGlyph = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
    <path
      fill="currentColor"
      d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.7 1.1 8.9.8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-.1 2.9-2.2c1.1-1.2 1.5-2.3 1.5-2.4-.1 0-2.8-1.1-2.8-4.4zM13.7 5.9c.6-.8 1.1-1.8.9-2.9-1 .1-2.1.7-2.7 1.5-.6.7-1.1 1.8-.9 2.8 1 .1 2-.6 2.7-1.4z"
    />
  </svg>
);

const LandingPage = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const signedIn = !loading && Boolean(user);

  return (
    <div className="landing">
      <header className="landing__top">
        <span className="landing__top-brand">{t("common.appName")}</span>
        <div className="landing__top-actions">
          <LanguageSwitcher compact />
          {signedIn ? (
            <Link href="/dashboard" className="btn btn-primary landing__top-cta">
              {t("landing.openApp")}
            </Link>
          ) : (
            <Link href="/login" className="btn btn-ghost landing__top-cta">
              {t("landing.signIn")}
            </Link>
          )}
        </div>
      </header>

      <section className="landing-hero" aria-label={t("common.appName")}>
        <div className="landing-hero__plane" aria-hidden>
          <div className="landing-hero__glow" />
          <div className="landing-hero__mesh" />
          <div className="landing-hero__wave" />
          <div className="landing-hero__coin landing-hero__coin--a" />
          <div className="landing-hero__coin landing-hero__coin--b" />
          <div className="landing-hero__coin landing-hero__coin--c" />
          <svg className="landing-hero__mark" viewBox="0 0 320 320" fill="none">
            <rect
              x="48"
              y="70"
              width="224"
              height="180"
              rx="28"
              stroke="currentColor"
              strokeWidth="10"
              opacity="0.28"
            />
            <path
              d="M96 128h128M96 164h96M96 200h72"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.35"
            />
            <circle cx="236" cy="214" r="34" fill="currentColor" opacity="0.18" />
          </svg>
        </div>

        <div className="landing-hero__copy">
          <p className="landing-hero__brand">{t("common.appName")}</p>
          <h1>{t("landing.headline")}</h1>
          <p className="landing-hero__sub">{t("landing.sub")}</p>
          <div className="landing-hero__cta">
            {signedIn ? (
              <Link href="/dashboard" className="btn btn-primary">
                {t("landing.openApp")}
              </Link>
            ) : (
              <>
                <Link href="/signup" className="btn btn-primary">
                  {t("landing.getStarted")}
                </Link>
                <Link href="/login" className="btn btn-ghost">
                  {t("landing.signIn")}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--clarity">
        <div className="landing-section__inner">
          <h2>{t("landing.clarityTitle")}</h2>
          <p>{t("landing.claritySub")}</p>
        </div>
      </section>

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

      <section className="landing-section landing-section--steps">
        <div className="landing-section__inner landing-section__inner--wide">
          <h2>{t("landing.stepsTitle")}</h2>
          <p className="landing-section__lead">{t("landing.stepsSub")}</p>
          <ol className="landing-steps">
            <li>
              <span>01</span>
              <strong>{t("landing.step1Title")}</strong>
              <p>{t("landing.step1Sub")}</p>
            </li>
            <li>
              <span>02</span>
              <strong>{t("landing.step2Title")}</strong>
              <p>{t("landing.step2Sub")}</p>
            </li>
            <li>
              <span>03</span>
              <strong>{t("landing.step3Title")}</strong>
              <p>{t("landing.step3Sub")}</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="landing-section landing-section--apps" id="mobile-apps">
        <div className="landing-section__inner landing-section__inner--wide">
          <div className="landing-apps">
            <div className="landing-apps__copy">
              <p className="landing-apps__eyebrow">{t("landing.appsEyebrow")}</p>
              <h2>{t("landing.appsTitle")}</h2>
              <p>{t("landing.appsSub")}</p>
            </div>
            <div className="landing-apps__stores">
              <button type="button" className="store-badge" disabled>
                <PlayStoreGlyph />
                <span>
                  <small>{t("landing.comingSoon")}</small>
                  <strong>Google Play</strong>
                </span>
              </button>
              <button type="button" className="store-badge" disabled>
                <AppStoreGlyph />
                <span>
                  <small>{t("landing.comingSoon")}</small>
                  <strong>App Store</strong>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-finale">
        <div className="landing-finale__inner">
          <h2>{t("landing.finaleTitle")}</h2>
          <p>{t("landing.finaleSub")}</p>
          <div className="landing-finale__cta">
            {signedIn ? (
              <Link href="/dashboard" className="btn btn-primary">
                {t("landing.openApp")}
              </Link>
            ) : (
              <>
                <Link href="/signup" className="btn btn-primary">
                  {t("landing.getStarted")}
                </Link>
                <Link href="/login" className="btn btn-ghost">
                  {t("landing.signIn")}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

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
    </div>
  );
};

export default LandingPage;
