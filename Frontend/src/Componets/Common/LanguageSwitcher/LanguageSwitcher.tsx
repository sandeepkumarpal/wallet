"use client";

import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import "./LanguageSwitcher.scss";

type Props = {
  compact?: boolean;
  className?: string;
};

const LanguageSwitcher = ({ compact = false, className = "" }: Props) => {
  const { t, i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || "en").split(
    "-"
  )[0];

  return (
    <div className={`lang-switcher ${compact ? "is-compact" : ""} ${className}`.trim()}>
      {!compact && (
        <label htmlFor="app-language" className="lang-switcher__label">
          {t("common.language")}
        </label>
      )}
      <select
        id="app-language"
        className="lang-switcher__select"
        aria-label={t("common.language")}
        value={current}
        onChange={(e) => {
          void i18n.changeLanguage(e.target.value);
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
