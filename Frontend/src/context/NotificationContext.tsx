"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  kind?: "budget" | "category" | "info";
};

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read"> & {
    id?: string;
  }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

const STORAGE_KEY = "wallet_in_app_notifications";
const FLAGS_KEY = "wallet_budget_alerts_flags_v2";

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

const loadStored = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) ? parsed.slice(0, 40) : [];
  } catch {
    return [];
  }
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(loadStored);

  const persist = useCallback((next: AppNotification[]) => {
    setNotifications(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 40)));
  }, []);

  const addNotification = useCallback(
    (n: Omit<AppNotification, "id" | "createdAt" | "read"> & { id?: string }) => {
      setNotifications((prev) => {
        const id = n.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        if (n.id && prev.some((p) => p.id === n.id)) return prev;
        const next: AppNotification[] = [
          {
            id,
            title: n.title,
            body: n.body,
            kind: n.kind || "info",
            createdAt: Date.now(),
            read: false,
          },
          ...prev,
        ].slice(0, 40);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const markRead = useCallback(
    (id: string) => {
      persist(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    },
    [notifications, persist]
  );

  const markAllRead = useCallback(() => {
    persist(notifications.map((n) => ({ ...n, read: true })));
  }, [notifications, persist]);

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markRead,
      markAllRead,
      clearAll,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markRead,
      markAllRead,
      clearAll,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
};

/** Dedup flags for budget threshold alerts (shared with useBudgetAlerts). */
export const hasAlertFlag = (month: string, flag: string) => {
  try {
    const all = JSON.parse(localStorage.getItem(FLAGS_KEY) || "{}") as Record<
      string,
      string[]
    >;
    return (all[month] || []).includes(flag);
  } catch {
    return false;
  }
};

export const setAlertFlag = (month: string, flag: string) => {
  try {
    const all = JSON.parse(localStorage.getItem(FLAGS_KEY) || "{}") as Record<
      string,
      string[]
    >;
    const set = new Set(all[month] || []);
    set.add(flag);
    all[month] = Array.from(set);
    localStorage.setItem(FLAGS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
};
