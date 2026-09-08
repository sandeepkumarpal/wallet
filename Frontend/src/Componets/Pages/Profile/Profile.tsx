import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, getErrorMessage } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { api } from "../../../utils/api";
import { API_URLS } from "../../../utils/Apiurls";
import { formatINR } from "../../../types/finance";
import ConfirmModal from "../../Common/ConfirmModal/ConfirmModal";
import { ProfileSkeleton } from "../../Common/PageSkeleton/PageSkeleton";
import { usePageGsap } from "../../../hooks/usePageGsap";
import PasswordField from "../../Common/PasswordField/PasswordField";
import "./Profile.scss";

const PROFILE_TARGETS = [
  ".profile-page__card",
  ".profile-page__prefs",
  ".profile-page__form",
] as const;

const Profile = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { user, logout, refreshUser, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  usePageGsap({
    rootRef,
    path: "/profile",
    enabled: Boolean(user) && !loading,
    targets: PROFILE_TARGETS,
  });

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post(API_URLS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
      setSuccess("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      await refreshUser();
    } catch (err) {
      setError(getErrorMessage(err, "Could not change password"));
    } finally {
      setSaving(false);
    }
  };

  const onLogout = () => {
    logout();
    setConfirmLogout(false);
    navigate("/login");
  };

  return (
    <div className="profile-page" ref={rootRef}>
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p>Account and preferences</p>
        </div>
      </div>

      {loading && !user ? (
        <ProfileSkeleton />
      ) : (
        <>
          <section className="panel profile-page__card">
            <div className="profile-page__avatar" aria-hidden>
              {(user?.fullName || "W").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>{user?.fullName}</h2>
              <p>{user?.email}</p>
              <p className="profile-page__budget">
                Monthly budget: {formatINR(user?.monthlyBudget || 0)}
              </p>
            </div>
          </section>

          <section className="panel profile-page__prefs">
            <h2>Preferences</h2>
            <div className="profile-page__pref-row">
              <div>
                <strong>Appearance</strong>
                <p>
                  {theme === "dark" ? "Dark" : "Light"} mode — also in the top
                  bar moon/sun icon
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={toggleTheme}
              >
                Switch to {theme === "dark" ? "light" : "dark"}
              </button>
            </div>
            <div className="profile-page__pref-row">
              <div>
                <strong>Spending alerts</strong>
                <p>
                  Budget warnings at 50%, 80%, and 100% show in the bell icon in
                  the top bar
                </p>
              </div>
            </div>
          </section>

          <form className="panel profile-page__form" onSubmit={onChangePassword}>
            <h2>Change password</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <PasswordField
              id="current"
              label="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <PasswordField
              id="next"
              label="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
            />
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Updating…" : "Update password"}
            </button>
          </form>

          <button
            type="button"
            className="btn btn-ghost profile-page__logout"
            onClick={() => setConfirmLogout(true)}
          >
            Log out
          </button>
        </>
      )}

      <ConfirmModal
        open={confirmLogout}
        title="Log out?"
        message="You'll need to sign in again to view your budget and transactions."
        confirmLabel="Log out"
        danger
        onConfirm={onLogout}
        onClose={() => setConfirmLogout(false)}
      />
    </div>
  );
};

export default Profile;
