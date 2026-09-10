type IconProps = {
  size?: number;
  className?: string;
};

/** Red expense — swapped to previous green direction */
export const ExpenseIcon = ({ size = 20, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden
  >
    <path
      d="M7.2 16.8L16.8 7.2"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M9.2 7.2H16.8V14.8"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Green income — swapped to previous red direction */
export const IncomeIcon = ({ size = 20, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden
  >
    <path
      d="M16.8 7.2L7.2 16.8"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M14.8 16.8H7.2V9.2"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const EmptyRecordsIcon = ({ size = 120, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    fill="none"
    className={className}
    aria-hidden
  >
    <circle cx="80" cy="80" r="72" fill="currentColor" opacity="0.06" />
    <rect
      x="42"
      y="38"
      width="76"
      height="92"
      rx="14"
      stroke="currentColor"
      strokeWidth="3"
      opacity="0.45"
    />
    <path
      d="M58 62h44M58 78h44M58 94h28"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.35"
    />
    <circle cx="112" cy="112" r="22" fill="var(--surface, #fff)" />
    <circle
      cx="112"
      cy="112"
      r="20"
      stroke="currentColor"
      strokeWidth="3"
      opacity="0.55"
    />
    <path
      d="M112 102v16M104 110h16"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.7"
    />
    <path
      d="M126 126l10 10"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      opacity="0.65"
    />
  </svg>
);

export const TransactionTypeIcon = ({
  type,
  size = 20,
  className,
}: IconProps & { type: "income" | "expense" }) =>
  type === "income" ? (
    <IncomeIcon size={size} className={className} />
  ) : (
    <ExpenseIcon size={size} className={className} />
  );
