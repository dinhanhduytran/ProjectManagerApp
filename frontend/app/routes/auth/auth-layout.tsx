import { useAuth } from "@/providers/auth-context";
import { Navigate, Outlet } from "react-router";
export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div
      className="w-full h-screen 
    "
    >
      <Outlet />
    </div>
  );
}
