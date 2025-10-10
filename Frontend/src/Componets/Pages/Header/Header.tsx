import React from "react";
import { Link } from "react-router-dom";
import "./Header.scss";

const Header: React.FC = () => {
  return (
    <header className="header">
      <nav className="nav">
        <ul className="nav-list">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/transactions">Transactions</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/change-password">Change Password</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
