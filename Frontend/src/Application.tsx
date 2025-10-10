import React from "react";
import Login from "./Componets/Pages/Login/Login";
import SignUp from "./Componets/Pages/SignUp/SignUp";
import Header from "./Componets/Pages/Header/Header";
import Dashboard from "./Componets/Pages/Dashboard/Dashboard";
import { Navigate, Route, Routes } from "react-router-dom";
import Transaction from "./Componets/Pages/Transactions/Transaction";
import Profile from "./Componets/Pages/Profile/Profile";

const Application = () => {
  const showHeaderRoutes = [
    "/dashboard",
    "/profile",
    "/changepassword",
    "/transactions",
  ];
  const showHeader = showHeaderRoutes.includes(location.pathname);
  return (
    <div>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile/>} />
        <Route
          path="/changepassword"
          element={<div>Change Password Page</div>}
        />
        <Route path="/transactions" element={<Transaction />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default Application;
