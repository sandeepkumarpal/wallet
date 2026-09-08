import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Keep shell stable — never blank the whole app while auth hydrates if we already have a user
  if (loading && !user) {
    return (
      <div className="page-loading" aria-busy="true">
        <div className="page-loading__bar" />
      </div>
    );
  }

  if (!loading && !user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
