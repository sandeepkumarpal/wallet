"use client";

import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, persistLanguage } from "@/i18n/config";
import "./LanguageSwitcher.scss";

type Props = {
  compact?: boolean;
  icon?: boolean;
  className?: string;
};

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
);

const LanguageSwitcher = ({
  compact = false,
  icon = false,
  className = "",
}: Props) => {
  const { t, i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || "en").split(
    "-"
  )[0];

  return (
    <div
      className={`lang-switcher ${compact ? "is-compact" : ""} ${icon ? "is-icon" : ""} ${className}`.trim()}
    >
      {!compact && !icon && (
        <label htmlFor="app-language" className="lang-switcher__label">
          {t("common.language")}
        </label>
      )}
      {icon ? <GlobeIcon /> : null}
      <select
        id={icon ? "app-language-icon" : "app-language"}
        className="lang-switcher__select"
        aria-label={t("common.language")}
        value={current}
        onChange={(e) => {
          const next = persistLanguage(e.target.value);
          void i18n.changeLanguage(next);
        }}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {t(lang.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
