import { useId, useState, type ChangeEventHandler } from "react";
import "./PasswordField.scss";

interface PasswordFieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.6 10.7a2.2 2.2 0 003.1 3.1M9.9 5.5A10.8 10.8 0 0121 12c-.5 1-1.2 2-2.1 2.9M6.1 6.2C4.5 7.5 3.4 9.1 3 12c.9 2.7 3.8 7 9 7 1.7 0 3.2-.4 4.5-1.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );

const PasswordField = ({
  id,
  label,
  value,
  onChange,
  autoComplete = "current-password",
  required = true,
  minLength,
}: PasswordFieldProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="field password-field">
      <label htmlFor={inputId}>{label}</label>
      <div className="password-field__wrap">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
        />
        <button
          type="button"
          className="password-field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          <EyeIcon open={visible} />
        </button>
      </div>
    </div>
  );
};

export default PasswordField;
