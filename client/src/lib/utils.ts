import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} min ago`;
  return "Just now";
}

export function calculatePayout(amount: number, odds: number): number {
  if (odds > 0) {
    return amount + (amount * odds / 100);
  } else {
    return amount + (amount * 100 / Math.abs(odds));
  }
}

export function getConfidenceColor(tier: string): string {
  switch (tier) {
    case "high":
      return "bg-green-500/20 text-green-400";
    case "medium":
      return "bg-yellow-500/20 text-yellow-400";
    case "low":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
}

export function getTagColor(tag: string): string {
  const colors = {
    "Smart Money": "bg-blue-500/20 text-blue-400",
    "Fade Public": "bg-red-500/20 text-red-400",
    "Line Movement": "bg-purple-500/20 text-purple-400",
    "Weather": "bg-cyan-500/20 text-cyan-400",
    "Injury News": "bg-orange-500/20 text-orange-400",
    "Home Favorite": "bg-green-500/20 text-green-400",
    "Road Dog": "bg-yellow-500/20 text-yellow-400",
    "Value": "bg-indigo-500/20 text-indigo-400",
    "Steam": "bg-pink-500/20 text-pink-400",
    "Trap Game": "bg-red-600/20 text-red-300",
  };
  return colors[tag as keyof typeof colors] || "bg-gray-500/20 text-gray-400";
}