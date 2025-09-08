import { useAuth } from "@/providers/auth-context";
import { Outlet } from "react-router";
import { Button } from "@/components/ui/button";

function DashboardLayout() {
  const { user, logout } = useAuth();

  // console.log("user", user);
  return (
    <div>
      <Button onClick={logout}>Log Out</Button>
    </div>
  );
}

export default DashboardLayout;
