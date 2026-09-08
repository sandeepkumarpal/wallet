import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { useLocation } from "react-router-dom";

type Options = {
  rootRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  budgetProgress: number;
};

/**
 * Enter animation once per Home visit. Budget bar updates quietly on data change
 * so number refreshes don't replay the whole page (avoids flicker).
 */
export const useDashboardGsap = ({
  rootRef,
  enabled,
  budgetProgress,
}: Options) => {
  const { pathname } = useLocation();
  const isHome = pathname === "/dashboard";
  const playedForVisit = useRef(false);
  const progressRef = useRef(budgetProgress);
  progressRef.current = budgetProgress;

  useEffect(() => {
    if (!isHome) playedForVisit.current = false;
  }, [isHome]);

  useEffect(() => {
    if (!isHome || !enabled) return;
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      playedForVisit.current = true;
      return;
    }
    if (playedForVisit.current) return;

    let cancelled = false;

    const play = () => {
      if (cancelled || !rootRef.current || playedForVisit.current) return;
      playedForVisit.current = true;
      const el = rootRef.current;
      const progress = Math.max(0, Math.min(100, progressRef.current));

      gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        tl.from(".dashboard__head > *", {
          y: 16,
          opacity: 0,
          duration: 0.45,
          stagger: 0.06,
        })
          .from(
            ".stat-card",
            {
              y: 22,
              opacity: 0,
              scale: 0.96,
              duration: 0.5,
              stagger: 0.07,
              clearProps: "transform",
            },
            "-=0.2"
          )
          .from(
            ".dashboard__budget",
            { y: 18, opacity: 0, duration: 0.4 },
            "-=0.25"
          );

        const barFill = el.querySelector(
          ".dashboard__bar > span"
        ) as HTMLElement | null;
        if (barFill) {
          tl.fromTo(
            barFill,
            { width: "0%" },
            {
              width: `${progress}%`,
              duration: 0.9,
              ease: "power3.out",
            },
            "-=0.15"
          );
        }

        tl.from(
          ".dashboard__chart, .dashboard__cats, .dashboard__type-pie, .dashboard__recent",
          {
            y: 20,
            opacity: 0,
            duration: 0.45,
            stagger: 0.08,
          },
          "-=0.45"
        );

        const curves = el.querySelectorAll(
          ".recharts-area-curve, .recharts-line-curve"
        );
        curves.forEach((node) => {
          const path = node as SVGPathElement;
          if (typeof path.getTotalLength !== "function") return;
          const len = path.getTotalLength();
          gsap.set(path, {
            strokeDasharray: len,
            strokeDashoffset: len,
          });
          tl.to(
            path,
            {
              strokeDashoffset: 0,
              duration: 1.15,
              ease: "power2.inOut",
            },
            "-=0.35"
          );
        });

        const areas = el.querySelectorAll(".recharts-area-area");
        if (areas.length) {
          tl.fromTo(
            areas,
            { opacity: 0 },
            { opacity: 1, duration: 0.7, ease: "power1.out" },
            "-=0.85"
          );
        }

        const sectors = el.querySelectorAll(".recharts-pie-sector");
        if (sectors.length) {
          tl.from(
            sectors,
            {
              scale: 0.2,
              opacity: 0,
              transformOrigin: "50% 50%",
              duration: 0.55,
              stagger: 0.05,
              ease: "back.out(1.6)",
              clearProps: "transform",
            },
            "-=0.7"
          );
        }

        const rows = el.querySelectorAll(".tx-list li, .dashboard__cats li");
        if (rows.length) {
          tl.from(
            rows,
            {
              x: -12,
              opacity: 0,
              duration: 0.35,
              stagger: 0.04,
            },
            "-=0.45"
          );
        }
      }, el);
    };

    const t = window.setTimeout(play, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [isHome, enabled, rootRef]);

  useEffect(() => {
    if (!isHome || !enabled || !playedForVisit.current) return;
    const root = rootRef.current;
    if (!root) return;
    const barFill = root.querySelector(
      ".dashboard__bar > span"
    ) as HTMLElement | null;
    if (!barFill) return;
    const width = `${Math.max(0, Math.min(100, budgetProgress))}%`;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      barFill.style.width = width;
      return;
    }
    gsap.to(barFill, {
      width,
      duration: 0.55,
      ease: "power2.out",
      overwrite: true,
    });
  }, [budgetProgress, isHome, enabled, rootRef]);
};
