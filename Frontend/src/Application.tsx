import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Login from "./Componets/Pages/Login/Login";
import SignUp from "./Componets/Pages/SignUp/SignUp";
import AppNav from "./Componets/Common/AppNav/AppNav";
import ProtectedRoute from "./Componets/Common/ProtectedRoute";
import PersistentPages from "./Componets/Common/PersistentPages";

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="app-shell">
      {!isAuthPage && <AppNav />}
      <main className={`app-main ${isAuthPage ? "app-main--auth" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
};

const Application = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      {/* Single route match so PersistentPages never remounts on tab change */}
      <Route element={<ProtectedRoute />}>
        <Route path="*" element={<PersistentPages />} />
      </Route>
    </Route>
  </Routes>
);

export default Application;
