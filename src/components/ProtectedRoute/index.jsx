import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (user === undefined) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
