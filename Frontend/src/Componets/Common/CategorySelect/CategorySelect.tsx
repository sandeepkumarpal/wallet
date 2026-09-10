"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CategoryIcon } from "../Icons/CategoryIcons";
import "./CategorySelect.scss";

type CategorySelectProps = {
  id?: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  invalid?: boolean;
  compact?: boolean;
  "aria-invalid"?: boolean | "true" | "false";
};

type MenuCoords = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export default function CategorySelect({
  id,
  value,
  options,
  onChange,
  invalid,
  compact,
  "aria-invalid": ariaInvalid,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const allOptions =
    value && !options.includes(value as never)
      ? [...options, value]
      : [...options];

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const gap = 6;
    const preferred = Math.min(256, window.innerHeight * 0.45);
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      120,
      Math.min(preferred, openUp ? spaceAbove : spaceBelow)
    );
    const top = openUp
      ? Math.max(8, rect.top - gap - maxHeight)
      : rect.bottom + gap;

    setCoords({
      top,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updateCoords();
    const onReposition = () => updateCoords();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
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

  const menu =
    open && mounted && coords
      ? createPortal(
          <ul
            id={listId}
            ref={menuRef}
            className="category-select__menu category-select__menu--portal"
            role="listbox"
            aria-label="Category"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
              maxHeight: coords.maxHeight,
            }}
          >
            {allOptions.map((option) => (
              <li key={option} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={option === value}
                  className={`category-select__option ${option === value ? "is-selected" : ""}`}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <CategoryIcon category={option} />
                  <span>{option}</span>
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )
      : null;

  return (
    <div
      className={`category-select ${open ? "is-open" : ""} ${invalid ? "is-invalid" : ""} ${compact ? "is-compact" : ""}`}
      ref={rootRef}
    >
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className="category-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={ariaInvalid}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="category-select__value">
          <CategoryIcon category={value} />
          <span>{value}</span>
        </span>
        <span className="category-select__caret" aria-hidden>
          ▾
        </span>
      </button>
      {menu}
    </div>
  );
}
