import type { ReactElement, ReactNode } from "react";
import "./CategoryIcons.scss";

type IconProps = {
  size?: number;
  className?: string;
};

const Svg = ({
  size = 18,
  className,
  children,
}: IconProps & { children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={["category-icon", className].filter(Boolean).join(" ")}
    aria-hidden
  >
    {children}
  </svg>
);

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const FoodIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 4v7a2 2 0 0 0 4 0V4" {...stroke} />
    <path d="M10 11v9" {...stroke} />
    <path d="M16 4v16" {...stroke} />
    <path d="M16 7c1.5 0 2.5.9 2.5 2S17.5 11 16 11" {...stroke} />
  </Svg>
);

export const TransportIcon = (p: IconProps) => (
  <Svg {...p}>
    <path
      d="M4 15.5h16v1.5a1 1 0 0 1-1 1h-1.2"
      {...stroke}
    />
    <path
      d="M5.5 15.5l1.2-6.2A1.5 1.5 0 0 1 8.2 8h7.6a1.5 1.5 0 0 1 1.5 1.3l1.2 6.2"
      {...stroke}
    />
    <path d="M8 8V7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" {...stroke} />
    <path d="M4 12.5h16" {...stroke} />
    <circle cx="7.5" cy="17.5" r="1.4" {...stroke} />
    <circle cx="16.5" cy="17.5" r="1.4" {...stroke} />
  </Svg>
);

export const RentIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 11.5 12 5l8 6.5" {...stroke} />
    <path d="M6.5 10.5V19h11v-8.5" {...stroke} />
    <path d="M10 19v-5h4v5" {...stroke} />
  </Svg>
);

export const UtilitiesIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v3" {...stroke} />
    <path d="M12 18v3" {...stroke} />
    <path d="M5.6 5.6l2.1 2.1" {...stroke} />
    <path d="M16.3 16.3l2.1 2.1" {...stroke} />
    <path d="M3 12h3" {...stroke} />
    <path d="M18 12h3" {...stroke} />
    <path d="M5.6 18.4l2.1-2.1" {...stroke} />
    <path d="M16.3 7.7l2.1-2.1" {...stroke} />
    <circle cx="12" cy="12" r="3.2" {...stroke} />
  </Svg>
);

export const ShoppingIcon = (p: IconProps) => (
  <Svg {...p}>
    <path
      d="M6.5 8.5h11l-1 10.2a1.5 1.5 0 0 1-1.5 1.3H9a1.5 1.5 0 0 1-1.5-1.3L6.5 8.5z"
      {...stroke}
    />
    <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" {...stroke} />
  </Svg>
);

export const HealthIcon = (p: IconProps) => (
  <Svg {...p}>
    <path
      d="M12 20.5s-6.5-4.2-6.5-9.2A3.8 3.8 0 0 1 12 8.2a3.8 3.8 0 0 1 6.5 3.1c0 5-6.5 9.2-6.5 9.2z"
      {...stroke}
    />
    <path d="M12 10.5v4M10 12.5h4" {...stroke} />
  </Svg>
);

export const EntertainmentIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="6.5" width="17" height="11" rx="2" {...stroke} />
    <path d="M8 20.5h8" {...stroke} />
    <path d="M10.5 11.2v2.6L13.8 12.5 10.5 11.2z" fill="currentColor" stroke="none" />
  </Svg>
);

export const EducationIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9.5 12 5l9 4.5-9 4.5L3 9.5z" {...stroke} />
    <path d="M7 11.8v4.2c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5v-4.2" {...stroke} />
    <path d="M21 9.5v6" {...stroke} />
  </Svg>
);

export const OtherIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    <circle cx="6.5" cy="12" r="1.6" fill="currentColor" />
    <circle cx="17.5" cy="12" r="1.6" fill="currentColor" />
  </Svg>
);

export const SalaryIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="6" width="16" height="12" rx="2" {...stroke} />
    <path d="M4 10h16" {...stroke} />
    <circle cx="12" cy="14" r="1.6" {...stroke} />
  </Svg>
);

export const FreelanceIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="5" width="16" height="11" rx="1.5" {...stroke} />
    <path d="M8 19h8" {...stroke} />
    <path d="M12 16v3" {...stroke} />
    <path d="M8 9h3M8 12h5" {...stroke} />
  </Svg>
);

export const InvestmentIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 17l5-5 3.5 3.5L20 7" {...stroke} />
    <path d="M14.5 7H20v5.5" {...stroke} />
  </Svg>
);

export const GiftIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="10" width="15" height="9.5" rx="1.5" {...stroke} />
    <path d="M4.5 13.5h15" {...stroke} />
    <path d="M12 10v9.5" {...stroke} />
    <path d="M12 10c-2.2 0-3.5-2.2-2.2-3.6S12 7.2 12 10z" {...stroke} />
    <path d="M12 10c2.2 0 3.5-2.2 2.2-3.6S12 7.2 12 10z" {...stroke} />
  </Svg>
);

const CATEGORY_ICONS: Record<string, (p: IconProps) => ReactElement> = {
  Food: FoodIcon,
  Transport: TransportIcon,
  Rent: RentIcon,
  Utilities: UtilitiesIcon,
  Shopping: ShoppingIcon,
  Health: HealthIcon,
  Entertainment: EntertainmentIcon,
  Education: EducationIcon,
  Other: OtherIcon,
  Salary: SalaryIcon,
  Freelance: FreelanceIcon,
  Investment: InvestmentIcon,
  Gift: GiftIcon,
};

export function CategoryIcon({
  category,
  size = 18,
  className,
}: IconProps & { category: string }) {
  const Icon = CATEGORY_ICONS[category] || OtherIcon;
  return <Icon size={size} className={className} />;
}
