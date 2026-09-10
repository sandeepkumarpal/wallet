import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";

type Options = {
  rootRef: RefObject<HTMLElement | null>;
  path: string;
  enabled?: boolean;
  targets: readonly string[];
};

/**
 * Enter animation once per visit. Does not replay when data refreshes (no flicker).
 */
export const usePageGsap = ({
  rootRef,
  path,
  enabled = true,
  targets,
}: Options) => {
  const pathname = usePathname();
  const active = pathname === path;
  const playedForVisit = useRef(false);
  const targetsKey = targets.join("|");

  useEffect(() => {
    if (!active) playedForVisit.current = false;
  }, [active]);

  useEffect(() => {
    if (!active || !enabled) return;
    if (playedForVisit.current) return;
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      playedForVisit.current = true;
      return;
    }

    window.dispatchEvent(new Event("resize"));

    let cancelled = false;

    const play = () => {
      if (cancelled || !rootRef.current || playedForVisit.current) return;
      const el = rootRef.current;
      const hasTargets = targets.some((sel) => el.querySelector(sel));
      if (!hasTargets && !el.querySelector(".page-head")) return;

      playedForVisit.current = true;

      gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        tl.from(".page-head > *", {
          y: 18,
          opacity: 0,
          duration: 0.55,
          stagger: 0.08,
        });

        if (targets.length) {
          tl.from(
            targets.join(", "),
            {
              y: 26,
              opacity: 0,
              scale: 0.96,
              duration: 0.7,
              stagger: 0.14,
              clearProps: "transform",
            },
            "-=0.18"
          );
        }

        if (el.querySelector(".profile-page__avatar")) {
          tl.from(
            ".profile-page__avatar",
            {
              scale: 0.45,
              opacity: 0,
              duration: 0.65,
              ease: "back.out(1.55)",
              clearProps: "transform",
            },
            "-=0.5"
          );
        }

        const fieldSel =
          ".budget-page__form .field, .profile-page__form .field, .transactions__form .field";
        if (el.querySelector(fieldSel)) {
          tl.from(
            fieldSel,
            {
              y: 16,
              opacity: 0,
              duration: 0.5,
              stagger: 0.07,
            },
            "-=0.3"
          );
        }

        const rowSel = ".tx-list li, .budget-page__cats li";
        if (el.querySelector(rowSel)) {
          tl.from(
            rowSel,
            {
              x: -14,
              opacity: 0,
              duration: 0.45,
              stagger: 0.055,
            },
            "-=0.25"
          );
        }

        const bar = el.querySelector(
          ".budget-page__hero .dashboard__bar > span"
        ) as HTMLElement | null;
        if (bar) {
          const width = bar.style.width || getComputedStyle(bar).width;
          tl.fromTo(
            bar,
            { width: "0%" },
            { width, duration: 1.1, ease: "power3.out" },
            "-=0.65"
          );
        }

        if (el.querySelector(".profile-page__logout")) {
          tl.from(
            ".profile-page__logout",
            {
              y: 12,
              opacity: 0,
              duration: 0.5,
            },
            "-=0.25"
          );
        }
      }, el);
    };

    const timer = window.setTimeout(play, 90);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active, enabled, path, rootRef, targets, targetsKey]);
};
