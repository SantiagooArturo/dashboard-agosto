import {
  Navbar,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem 
} from "@heroui/dropdown";
import { Menu, Bell, Settings, LogOut, User } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface AdminNavbarProps {
  onMenuClick: () => void;
}

export const AdminNavbar = ({ onMenuClick }: AdminNavbarProps) => {
  return (    <Navbar 
      isBordered
      className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700"
      maxWidth="full"
    >
      <NavbarContent justify="start">
        <NavbarItem>
          <Button
            isIconOnly
            variant="light"
            className="lg:hidden"
            onPress={onMenuClick}
          >
            <Menu size={20} />
          </Button>
        </NavbarItem>
      </NavbarContent>      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>
        
        <NavbarItem>
          <Button isIconOnly variant="light">
            <Bell size={20} />
          </Button>
        </NavbarItem>
        
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform"
                size="sm"
                src="/avatars/admin.jpg"
                name="Admin"
                showFallback
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Administrador</p>
                <p className="font-light">admin@myworkin.com</p>
              </DropdownItem>
              <DropdownItem key="settings" startContent={<Settings size={18} />}>
                Configuración
              </DropdownItem>
              <DropdownItem key="profile_settings" startContent={<User size={18} />}>
                Mi Perfil
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                color="danger" 
                startContent={<LogOut size={18} />}
              >
                Cerrar Sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};
