import React from "react";
import "./CommonButton.scss";

interface CommonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const CommonButton: React.FC<CommonButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = "button",
  className = "",
}) => (
  <button
    className={`common-btn ${className}`}
    onClick={onClick}
    disabled={disabled}
    type={type}
  >
    {children}
  </button>
);

export default CommonButton;
