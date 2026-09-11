"use client";

import { useState, useTransition, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/AuthContext";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import NavActions from "./NavActions";
import "./AppNav.scss";

const AppNav = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [, startTransition] = useTransition();

  const links = [
    { to: "/dashboard", label: t("nav.home") },
    { to: "/transactions", label: t("nav.spend") },
    { to: "/budget", label: t("nav.budget") },
    { to: "/profile", label: t("nav.you") },
  ];

  const handleLogout = () => {
    logout();
    setConfirmLogout(false);
    router.push("/login");
  };

  const go = (to: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    startTransition(() => {
      router.push(to);
    });
  };

  return (
    <>
      <header className="top-nav">
        <div className="top-nav__inner">
          <Link
            href="/dashboard"
            className={`top-nav__brand${pathname === "/dashboard" ? " active" : ""}`}
            onClick={go("/dashboard")}
          >
            <span className="top-nav__mark" aria-hidden />
            {t("common.appName")}
          </Link>
          <nav className="top-nav__links" aria-label="Primary">
            {links.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className={pathname === link.to ? "active" : undefined}
                onClick={go(link.to)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="top-nav__user">
            <LanguageSwitcher compact className="top-nav__lang" />
            <LanguageSwitcher icon className="top-nav__lang-icon" />
            <NavActions />
            <span className="top-nav__name">
              {user?.fullName?.split(" ")[0] || t("common.account")}
            </span>
            <button
              type="button"
              className="btn btn-ghost top-nav__logout"
              onClick={() => setConfirmLogout(true)}
            >
              {t("common.logOut")}
            </button>
            <button
              type="button"
              className="nav-icon-btn top-nav__logout-icon"
              aria-label={t("common.logOut")}
              title={t("common.logOut")}
              onClick={() => setConfirmLogout(true)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
                <path
                  d="M10 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M15 8l4 4-4 4M10 12h9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <nav className="bottom-nav" aria-label="Mobile">
        {links.map((link) => (
          <Link
            key={link.to}
            href={link.to}
            className={`bottom-nav__item${pathname === link.to ? " active" : ""}`}
            onClick={go(link.to)}
          >
            <span className="bottom-nav__dot" aria-hidden />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <ConfirmModal
        open={confirmLogout}
        title={t("nav.logoutTitle")}
        message={t("nav.logoutMessage")}
        confirmLabel={t("common.logOut")}
        danger
        onConfirm={handleLogout}
        onClose={() => setConfirmLogout(false)}
      />
    </>
  );
};

export default AppNav;
