"use client";

import type { ReactNode } from "react";
import { EmptyRecordsIcon } from "../Icons/TransactionIcons";
import "./EmptyState.scss";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

const EmptyState = ({
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) => (
  <div className={`empty-state empty-state--rich ${className}`.trim()}>
    <div className="empty-state__art" aria-hidden>
      <EmptyRecordsIcon />
    </div>
    <h3 className="empty-state__title">{title}</h3>
    {description ? (
      <p className="empty-state__desc">{description}</p>
    ) : null}
    {action ? <div className="empty-state__action">{action}</div> : null}
  </div>
);

export default EmptyState;
