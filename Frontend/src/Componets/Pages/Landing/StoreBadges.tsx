"use client";

import { useTranslation } from "react-i18next";

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

const StoreBadges = () => {
  const { t } = useTranslation();

  return (
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
  );
};

export default StoreBadges;
