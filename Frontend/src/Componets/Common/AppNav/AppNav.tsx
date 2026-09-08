import { useState, useTransition, type MouseEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import NavActions from "./NavActions";
import "./AppNav.scss";

const links = [
  { to: "/dashboard", label: "Home" },
  { to: "/transactions", label: "Spend" },
  { to: "/budget", label: "Budget" },
  { to: "/profile", label: "You" },
];

const AppNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [, startTransition] = useTransition();

  const handleLogout = () => {
    logout();
    setConfirmLogout(false);
    navigate("/login");
  };

  const go = (to: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    startTransition(() => {
      navigate(to);
    });
  };

  return (
    <>
      <header className="top-nav">
        <div className="top-nav__inner">
          <NavLink
            to="/dashboard"
            className="top-nav__brand"
            onClick={go("/dashboard")}
          >
            <span className="top-nav__mark" aria-hidden />
            Wallet
          </NavLink>
          <nav className="top-nav__links" aria-label="Primary">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={go(link.to)}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="top-nav__user">
            <NavActions />
            <span className="top-nav__name">
              {user?.fullName?.split(" ")[0] || "Account"}
            </span>
            <button
              type="button"
              className="btn btn-ghost top-nav__logout"
              onClick={() => setConfirmLogout(true)}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <nav className="bottom-nav" aria-label="Mobile">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="bottom-nav__item"
            onClick={go(link.to)}
          >
            <span className="bottom-nav__dot" aria-hidden />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <ConfirmModal
        open={confirmLogout}
        title="Log out?"
        message="You’ll need to sign in again to view your budget and transactions."
        confirmLabel="Log out"
        danger
        onConfirm={handleLogout}
        onClose={() => setConfirmLogout(false)}
      />
    </>
  );
};

export default AppNav;
