"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotifications } from "../../../context/NotificationContext";
import { useTheme } from "../../../context/ThemeContext";

const NavActions = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead, clearAll } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const timeAgo = (ts: number) => {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return t("common.justNow");
    if (mins < 60) return t("common.minsAgo", { count: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t("common.hoursAgo", { count: hrs });
    const days = Math.floor(hrs / 24);
    return t("common.daysAgo", { count: days });
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="nav-actions" ref={panelRef}>
      <button
        type="button"
        className="nav-icon-btn"
        aria-label={
          theme === "dark" ? t("nav.switchToLight") : t("nav.switchToDark")
        }
        title={theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}
        onClick={toggleTheme}
      >
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <path
              fill="currentColor"
              d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.48 0l1.79-1.8 1.41 1.41-1.8 1.79-1.4-1.4zM12 4V1h-0.01v3H12zm0 19v-3h-.01v3H12zM4 12H1v-.01h3V12zm19 0h-3v-.01h3V12zM6.76 19.16l-1.42 1.42-1.79-1.8 1.41-1.41 1.8 1.79zm12.02 1.42l-1.41-1.41 1.79-1.8 1.41 1.41-1.79 1.8zM12 8a4 4 0 100 8 4 4 0 000-8z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <path
              fill="currentColor"
              d="M12.1 22c-5.2-.3-9.4-4.5-9.7-9.7C2 6.4 7.1 1.5 12.9 2c.4 0 .7.4.6.8-1.2 4.5 1.6 9 6.1 10.1.4.1.6.5.5.9C18.8 18.9 15.7 22.1 12.1 22z"
            />
          </svg>
        )}
      </button>

      <button
        type="button"
        className={`nav-icon-btn${unreadCount ? " has-unread" : ""}`}
        aria-label={
          unreadCount
            ? t("nav.notificationsUnread", { count: unreadCount })
            : t("nav.notifications")
        }
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
        }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <path
            fill="currentColor"
            d="M12 22a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22zm6-6V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="nav-icon-btn__badge" aria-hidden>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="nav-notify"
          role="dialog"
          aria-label={t("nav.notifications")}
        >
          <div className="nav-notify__head">
            <strong>{t("nav.notifications")}</strong>
            <div className="nav-notify__actions">
              {unreadCount > 0 && (
                <button type="button" onClick={markAllRead}>
                  {t("nav.markRead")}
                </button>
              )}
              {notifications.length > 0 && (
                <button type="button" onClick={clearAll}>
                  {t("common.clear")}
                </button>
              )}
            </div>
          </div>
          {notifications.length === 0 ? (
            <p className="nav-notify__empty">{t("nav.noAlerts")}</p>
          ) : (
            <ul className="nav-notify__list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={n.read ? "" : "is-unread"}
                  onClick={() => markRead(n.id)}
                >
                  <strong>{n.title}</strong>
                  <span>{n.body}</span>
                  <em>{timeAgo(n.createdAt)}</em>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NavActions;
