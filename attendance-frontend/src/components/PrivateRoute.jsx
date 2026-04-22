import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="center-wrapper">
        <div className="app-spinner"></div>
      </div>
    );
  }

  // If no user/token context, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;
