import { SidebarComponent } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <SidebarComponent />
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        <Navbar />
        <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-900">{children}</main>
      </div>
    </div>
  );
}
