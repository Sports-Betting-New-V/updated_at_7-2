import { useQuery } from "@tanstack/react-query";
import { User, ChartLine, LogIn, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import type { User as UserType } from "@shared/schema";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: fallbackUser } = useQuery<UserType>({
    queryKey: ["/api/user"],
    enabled: !isAuthenticated,
  });

  const currentUser = user || fallbackUser;

  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/predictions", label: "Predictions" },
    { path: "/simulator", label: "Simulator" },
    { path: "/history", label: "History" },
    { path: "/analytics", label: "Analytics" },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <ChartLine className="text-2xl text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">BetEdge Pro</h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`transition-colors font-medium ${
                    location === item.path
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser && (
              <div className="text-right">
                <div className="text-sm text-slate-500 dark:text-slate-400">Virtual Bankroll</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(currentUser.bankroll)}
                </div>
              </div>
            )}
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="text-sm text-white" />
                    </div>
                  )}
                  <span className="hidden sm:block font-medium text-slate-900 dark:text-white">
                    {user?.firstName || user?.email || "User"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/api/logout"}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => window.location.href = "/api/login"}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
