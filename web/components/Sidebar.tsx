"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  Calendar,
  Trophy,
  Apple,
  Bot,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/entrainements", label: "Entraînements", icon: Dumbbell },
  { href: "/programmes", label: "Programmes", icon: Calendar },
  { href: "/records", label: "Records PR", icon: Trophy },
  { href: "/nutrition", label: "Nutrition", icon: Apple },
  { href: "/assistant", label: "Assistant IA", icon: Bot },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-[100]"
      style={{
        width: "240px",
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #E5E5E5",
        isolation: "isolate",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b" style={{ borderColor: "#E5E5E5" }}>
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 36, height: 36, backgroundColor: "#1DB954" }}
        >
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg text-[#1A1A1A]">FitTrack Pro</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group w-full cursor-pointer"
              style={{
                backgroundColor: isActive ? "rgba(29, 185, 84, 0.15)" : "transparent",
                color: isActive ? "#1DB954" : "#666666",
              }}
              prefetch={true}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#F0F0F0";
                  e.currentTarget.style.color = "#1A1A1A";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#666666";
                }
              }}
            >
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: isActive ? "#1DB954" : "inherit" }}
              />
              <span className="text-sm font-medium">{label}</span>
              {isActive && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#1DB954" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="px-4 py-4 border-t" style={{ borderColor: "#E5E5E5" }}>
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback
              className="text-sm font-semibold"
              style={{ backgroundColor: "#1DB954", color: "#FFFFFF" }}
            >
              DA
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#1A1A1A]">Dimitri A.</span>
            <span className="text-xs" style={{ color: "#666666" }}>
              82 kg · PPL
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
