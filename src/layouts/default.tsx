import { Link } from "@heroui/link";
import { useState } from "react";
import { Button } from "@heroui/button";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  CreditCard,
  X
} from "lucide-react";
import { useLocation, Link as RouterLink } from "react-router-dom";

import { AdminNavbar } from "@/components/admin-navbar";

const menuItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/"
  },
  {
    key: "users",
    label: "Usuarios",
    icon: Users,
    href: "/users"
  },
  {
    key: "jobs",
    label: "Empleos",
    icon: Briefcase,
    href: "/jobs"
  },
  {
    key: "cvs",
    label: "CVs",
    icon: FileText,
    href: "/cvs"
  },
  {
    key: "interviews",
    label: "Entrevistas",
    icon: Calendar,
    href: "/interviews"
  },
  {
    key: "transactions",
    label: "Transacciones",
    icon: CreditCard,
    href: "/transactions"
  }
];

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-primary">MyWorkIn Admin</h1>
          <Button
            isIconOnly
            variant="light"
            className="lg:hidden"
            onPress={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <RouterLink
                key={item.key}
                to={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary border-r-2 border-primary' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </RouterLink>
            );
          })}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:ml-0">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
        
        <footer className="bg-white border-t px-6 py-4">
          <div className="flex items-center justify-center">
            <Link
              isExternal
              className="flex items-center gap-1 text-current"
              href="https://heroui.com"
              title="heroui.com homepage"
            >
              <span className="text-default-600">Powered by</span>
              <p className="text-primary">HeroUI</p>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
