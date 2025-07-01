import { useQuery } from "@tanstack/react-query";
import { User, ChartLine } from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import type { User as UserType } from "@shared/schema";

export function Header() {
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

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
            <div className="text-right">
              <div className="text-sm text-slate-500 dark:text-slate-400">Virtual Bankroll</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {user ? formatCurrency(user.bankroll) : "$0.00"}
              </div>
            </div>
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                <User className="text-sm text-white" />
              </div>
              <span className="hidden sm:block font-medium text-slate-900 dark:text-white">
                {user?.username || "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
