import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { user, loading, isDemo } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute]', { user: !!user, loading, isDemo });

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-vibe-mint border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isDemo || user) {
    return <>{children}</>;
  }

  return <Navigate to="/" state={{ from: location, showAuth: true }} replace />;
}
