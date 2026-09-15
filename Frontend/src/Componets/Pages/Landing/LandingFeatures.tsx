"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type TouchEvent,
  type TransitionEvent,
} from "react";
import { useTranslation } from "react-i18next";

const SLIDES = ["home", "spend", "budget", "month"] as const;
type SlideId = (typeof SLIDES)[number];

const StatusBar = () => (
  <div className="iphone-status" aria-hidden>
    <span className="iphone-status__time">9:41</span>
    <span className="iphone-status__icons">
      <i className="iphone-status__signal" />
      <i className="iphone-status__wifi" />
      <i className="iphone-status__battery" />
    </span>
  </div>
);

type TabId = "home" | "spend" | "budget" | "you";

const IconHome = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden>
    <path
      d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const IconSpend = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden>
    <path
      d="M8 7h11M8 12h11M8 17h8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="5" cy="7" r="1.2" fill="currentColor" />
    <circle cx="5" cy="12" r="1.2" fill="currentColor" />
    <circle cx="5" cy="17" r="1.2" fill="currentColor" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden>
    <path
      d="M12 6v12M6 12h12"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

const IconBudget = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M12 4a8 8 0 0 1 8 8h-8V4Z"
      fill="currentColor"
      opacity="0.35"
    />
  </svg>
);

const IconYou = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden>
    <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M5 19.5c1.4-3.2 3.8-4.8 7-4.8s5.6 1.6 7 4.8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const MockTabBar = ({ active }: { active: TabId }) => (
  <nav className="lf-tabbar" aria-hidden>
    <span className={`lf-tabbar__item${active === "home" ? " is-on" : ""}`}>
      <IconHome />
    </span>
    <span className={`lf-tabbar__item${active === "spend" ? " is-on" : ""}`}>
      <IconSpend />
    </span>
    <span className="lf-tabbar__fab">
      <IconPlus />
    </span>
    <span className={`lf-tabbar__item${active === "budget" ? " is-on" : ""}`}>
      <IconBudget />
    </span>
    <span className={`lf-tabbar__item${active === "you" ? " is-on" : ""}`}>
      <IconYou />
    </span>
  </nav>
);

const PhoneHome = () => (
  <div className="lf-screen lf-screen--home">
    <StatusBar />
    <header className="lf-screen__hdr">
      <div>
        <small>Good morning</small>
        <strong>Hi, Asha</strong>
      </div>
      <em className="lf-pill">On track</em>
    </header>
    <div className="lf-card lf-card--hero">
      <small>Left in budget</small>
      <b>₹24,680</b>
      <div className="lf-progress">
        <span style={{ width: "68%" }} />
      </div>
      <p>₹57,320 of ₹75,000 spent</p>
    </div>
    <div className="lf-pair">
      <div className="lf-card">
        <small>Income</small>
        <b className="is-in">₹82,000</b>
      </div>
      <div className="lf-card">
        <small>Spent</small>
        <b className="is-out">₹57,320</b>
      </div>
    </div>
    <p className="lf-label">Recent</p>
    <ul className="lf-list">
      <li>
        <span className="lf-avatar is-in">S</span>
        <div>
          <strong>Salary</strong>
          <small>Bank · 1 Mar</small>
        </div>
        <em className="is-in">+₹72,000</em>
      </li>
      <li>
        <span className="lf-avatar is-out">R</span>
        <div>
          <strong>Rent</strong>
          <small>UPI · 2 Mar</small>
        </div>
        <em className="is-out">−₹18,000</em>
      </li>
      <li>
        <span className="lf-avatar is-out">G</span>
        <div>
          <strong>Groceries</strong>
          <small>UPI · Today</small>
        </div>
        <em className="is-out">−₹3,420</em>
      </li>
    </ul>
    <MockTabBar active="home" />
  </div>
);

const PhoneSpend = () => (
  <div className="lf-screen lf-screen--spend">
    <StatusBar />
    <header className="lf-screen__hdr">
      <strong>Spend</strong>
      <em className="lf-pill">March</em>
    </header>
    <div className="lf-search">Search note or category</div>
    <div className="lf-chips">
      <span className="is-on">All</span>
      <span>Expense</span>
      <span>Income</span>
    </div>
    <div className="lf-card lf-card--net">
      <small>Net this month</small>
      <b className="is-in">+₹24,680</b>
      <div className="lf-pair lf-pair--mini">
        <div>
          <small>In</small>
          <em className="is-in">₹82k</em>
        </div>
        <div>
          <small>Out</small>
          <em className="is-out">₹57k</em>
        </div>
      </div>
    </div>
    <ul className="lf-list">
      <li>
        <span className="lf-avatar is-out">G</span>
        <div>
          <strong>Groceries</strong>
          <small>UPI · Today</small>
        </div>
        <em className="is-out">−₹840</em>
      </li>
      <li>
        <span className="lf-avatar is-in">F</span>
        <div>
          <strong>Freelance</strong>
          <small>Bank · Yesterday</small>
        </div>
        <em className="is-in">+₹12,000</em>
      </li>
      <li>
        <span className="lf-avatar is-out">M</span>
        <div>
          <strong>Metro</strong>
          <small>UPI · Mon</small>
        </div>
        <em className="is-out">−₹120</em>
      </li>
      <li>
        <span className="lf-avatar is-out">U</span>
        <div>
          <strong>Utilities</strong>
          <small>Card · Sun</small>
        </div>
        <em className="is-out">−₹2,450</em>
      </li>
    </ul>
    <MockTabBar active="spend" />
  </div>
);

const PhoneBudget = () => (
  <div className="lf-screen lf-screen--budget">
    <StatusBar />
    <header className="lf-screen__hdr">
      <strong>Budget</strong>
      <em className="lf-pill">68% used</em>
    </header>
    <div className="lf-card lf-card--hero">
      <small>Monthly ceiling</small>
      <b>₹75,000</b>
      <div className="lf-progress">
        <span style={{ width: "68%" }} />
      </div>
      <p>₹17,680 left · 16 days remaining</p>
    </div>
    <p className="lf-label">Categories</p>
    <ul className="lf-cats">
      {[
        ["Food", "₹8.2k", 72, "#1a7a62"],
        ["Rent", "₹18k", 100, "#b93737"],
        ["Transport", "₹2.1k", 45, "#0f4f42"],
        ["Shopping", "₹4.6k", 58, "#c45c26"],
      ].map(([name, amt, pct, color]) => (
        <li key={String(name)}>
          <div className="lf-cats__row">
            <strong>{name}</strong>
            <span>{amt}</span>
          </div>
          <div className="lf-progress">
            <span style={{ width: `${pct}%`, background: String(color) }} />
          </div>
        </li>
      ))}
    </ul>
    <MockTabBar active="budget" />
  </div>
);

const PhoneMonth = () => (
  <div className="lf-screen lf-screen--month">
    <StatusBar />
    <header className="lf-screen__hdr">
      <strong>Overview</strong>
      <em className="lf-pill">March</em>
    </header>
    <div className="lf-card lf-card--hero">
      <small>Income − expenses</small>
      <b className="is-in">+₹24,680</b>
      <p>Best week so far this month</p>
    </div>
    <div className="lf-chart" aria-hidden>
      {[38, 52, 44, 68, 50, 74, 60].map((h, i) => (
        <div key={i} className="lf-chart__col">
          <span style={{ height: `${h}%` }} />
          <small>{["M", "T", "W", "T", "F", "S", "S"][i]}</small>
        </div>
      ))}
    </div>
    <div className="lf-pair">
      <div className="lf-card">
        <small>Top spend</small>
        <b>Rent</b>
      </div>
      <div className="lf-card">
        <small>Quietest day</small>
        <b>Tue</b>
      </div>
    </div>
    <MockTabBar active="home" />
  </div>
);

const SCREENS: Record<SlideId, () => ReactNode> = {
  home: PhoneHome,
  spend: PhoneSpend,
  budget: PhoneBudget,
  month: PhoneMonth,
};

const IphoneFrame = ({
  children,
  caption,
  active,
  onSelect,
}: {
  children: ReactNode;
  caption: string;
  active?: boolean;
  onSelect?: () => void;
}) => (
  <figure
    className={`iphone${active ? " is-active" : ""}`}
    onClick={onSelect}
  >
    <div className="iphone__frame">
      <div className="iphone__side iphone__side--left" aria-hidden />
      <div className="iphone__side iphone__side--right" aria-hidden />
      <div className="iphone__screen">
        <div className="iphone__island" aria-hidden />
        {children}
        <div className="iphone__home" aria-hidden />
      </div>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>
);

const LEN = SLIDES.length;
/** Triple copy so we can slide forever and teleport in the middle set. */
const LOOP = [...SLIDES, ...SLIDES, ...SLIDES];

const LandingFeatures = () => {
  const { t } = useTranslation();
  const [index, setIndex] = useState<number>(LEN);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const indexRef = useRef<number>(LEN);
  const pausedRef = useRef(false);
  const jumping = useRef(false);
  indexRef.current = index;
  pausedRef.current = paused;

  const logical = ((index % LEN) + LEN) % LEN;

  const step = useCallback((dir: 1 | -1) => {
    if (jumping.current) return;
    setAnimate(true);
    setIndex((i) => i + dir);
  }, []);

  const goTo = useCallback(
    (target: number) => {
      if (jumping.current) return;
      setAnimate(true);
      setIndex((i) => {
        const current = ((i % LEN) + LEN) % LEN;
        let diff = target - current;
        if (diff > LEN / 2) diff -= LEN;
        if (diff < -LEN / 2) diff += LEN;
        return i + diff;
      });
    },
    []
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      if (pausedRef.current || jumping.current) return;
      setAnimate(true);
      setIndex((i) => i + 1);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const onTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "transform") return;

    if (index >= LEN * 2 || index < LEN) {
      jumping.current = true;
      setAnimate(false);
      const next = LEN + (((index % LEN) + LEN) % LEN);
      setIndex(next);
      indexRef.current = next;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          jumping.current = false;
          setAnimate(true);
        });
      });
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 36) return;
    step(dx < 0 ? 1 : -1);
  };

  const active = SLIDES[logical];

  return (
    <section
      className="landing-section landing-section--features"
      id="features"
      aria-labelledby="landing-features-title"
    >
      <div className="landing-section__inner landing-section__inner--features">
        <div className="landing-features__intro">
          <p className="landing-features__eyebrow">{t("landing.featuresEyebrow")}</p>
          <h2 id="landing-features-title">{t("landing.featuresTitle")}</h2>
          <p>{t("landing.featuresSub")}</p>
        </div>

        <div
          className="landing-features__carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="landing-features__viewport">
            <div
              className={`landing-features__track${animate ? "" : " is-instant"}`}
              style={{ "--i": index } as CSSProperties}
              onTransitionEnd={onTransitionEnd}
              aria-live="polite"
            >
              {LOOP.map((id, i) => {
                const Screen = SCREENS[id];
                return (
                  <IphoneFrame
                    key={`${id}-${i}`}
                    caption={t(`landing.feature.${id}`)}
                    active={i === index}
                    onSelect={() => goTo(SLIDES.indexOf(id))}
                  >
                    <Screen />
                  </IphoneFrame>
                );
              })}
            </div>
          </div>

          <div className="landing-features__controls">
            <button
              type="button"
              className="landing-features__nav"
              aria-label={t("landing.featuresPrev")}
              onClick={() => step(-1)}
            >
              ‹
            </button>
            <div className="landing-features__dots" role="tablist">
              {SLIDES.map((id, i) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={i === logical}
                  aria-label={t(`landing.feature.${id}`)}
                  className={i === logical ? "is-on" : undefined}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <button
              type="button"
              className="landing-features__nav"
              aria-label={t("landing.featuresNext")}
              onClick={() => step(1)}
            >
              ›
            </button>
          </div>

          <p className="landing-features__note" key={active}>
            {t(`landing.feature.${active}Detail`)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
