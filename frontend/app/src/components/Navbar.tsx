import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LogOut,
  Moon,
  Sun,
  GraduationCap,
} from 'lucide-react';

interface NavbarProps {
  userName: string;
  userRole: string;
}

export const Navbar: React.FC<NavbarProps> = ({ userName, userRole }) => {
  const { logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };



  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      className="sticky top-0 z-40 w-full border-b backdrop-blur-lg"
      style={{
        background: `${theme.surface}80`,
        borderColor: theme.border,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: theme.gradient }}
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                className="text-lg font-bold hidden sm:block"
                style={{ color: theme.text }}
              >
                College ERP
              </h1>
              <p
                className="text-xs hidden sm:block"
                style={{ color: theme.textMuted }}
              >
                {userRole} Dashboard
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
            >
              {isDark ? (
                <Sun className="w-5 h-5" style={{ color: theme.warning }} />
              ) : (
                <Moon className="w-5 h-5" style={{ color: theme.textMuted }} />
              )}
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 px-3 py-2 h-auto rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className="text-sm font-medium"
                      style={{
                        background: theme.gradient,
                        color: 'white',
                      }}
                    >
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p
                      className="text-sm font-medium"
                      style={{ color: theme.text }}
                    >
                      {userName}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      {userRole}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56"
                style={{ background: theme.surface, borderColor: theme.border }}
              >
                <div className="px-3 py-2 sm:hidden">
                  <p className="text-sm font-medium" style={{ color: theme.text }}>
                    {userName}
                  </p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    {userRole}
                  </p>
                </div>
                <DropdownMenuSeparator className="sm:hidden" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500 focus:text-red-500"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
