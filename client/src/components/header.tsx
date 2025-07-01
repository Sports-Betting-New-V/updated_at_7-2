import { useQuery } from "@tanstack/react-query";
import { User, ChartLine } from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatCurrency } from "@/lib/utils";
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
    <header className="bg-[#1E293B] border-b border-[#334155]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <ChartLine className="text-2xl text-[#1E40AF]" />
              <h1 className="text-xl font-bold">BetEdge Pro</h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`transition-colors font-medium ${
                    location === item.path
                      ? "text-[#1E40AF]"
                      : "text-slate-400 hover:text-[#1E40AF]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-slate-400">Virtual Bankroll</div>
              <div className="text-lg font-bold text-[#10B981]">
                {user ? formatCurrency(user.bankroll) : "$0.00"}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#1E40AF] rounded-full flex items-center justify-center">
                <User className="text-sm" />
              </div>
              <span className="hidden sm:block font-medium">
                {user?.username || "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
