"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { getErrorMessage, useAuth } from "@/context/AuthContext";
import { isGoogleAuthEnabled } from "@/components/GoogleAuthProvider";

type Props = {
  onSuccessNavigate: () => void;
  onError?: (message: string) => void;
};

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.4c-.3 1.5-1.1 2.7-2.4 3.5v2.9h3.9c2.3-2.1 3.6-5.2 3.6-8.5z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-2.9c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3c2 4 6.1 6.5 10.6 6.5z"
    />
    <path
      fill="#FBBC05"
      d="M5.4 14.5c-.2-.7-.4-1.4-.4-2.5s.1-1.8.4-2.5V6.6H1.4C.5 8.4 0 10.1 0 12s.5 3.6 1.4 5.4l4-3z"
    />
    <path
      fill="#EA4335"
      d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.5 0 3.4 2.5 1.4 6.6l4 3C6.3 6.8 8.9 4.8 12 4.8z"
    />
  </svg>
);

const GoogleSignInButton = ({ onSuccessNavigate, onError }: Props) => {
  const { t } = useTranslation();
  const { loginWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const enabled = isGoogleAuthEnabled();

  const handleCredential = async (credential?: string) => {
    if (!credential) {
      onError?.(t("auth.googleFailed"));
      return;
    }
    setBusy(true);
    try {
      await loginWithGoogle(credential);
      onSuccessNavigate();
    } catch (err) {
      onError?.(getErrorMessage(err, t("auth.googleFailed")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`auth-google${busy ? " is-busy" : ""}`}>
      <div className="auth-google__divider">
        <span>{t("auth.orContinueWith")}</span>
      </div>

      {enabled ? (
        <div className="auth-google__btn">
          <GoogleLogin
            onSuccess={(response) => void handleCredential(response.credential)}
            onError={() => onError?.(t("auth.googleFailed"))}
            useOneTap={false}
            theme="outline"
            size="large"
            shape="rectangular"
            text="continue_with"
            width="320"
          />
        </div>
      ) : (
        <button
          type="button"
          className="auth-google__custom"
          onClick={() => onError?.(t("auth.googleNotConfigured"))}
        >
          <GoogleMark />
          <span>{t("auth.continueWithGoogle")}</span>
        </button>
      )}
    </div>
  );
};

export default GoogleSignInButton;
