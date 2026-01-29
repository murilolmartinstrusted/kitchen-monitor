"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed,
  SprayCanIcon,
  HardHat,
  FileText,
  LayoutDashboard,
  ChefHat,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  {
    name: "Visao Geral",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Auditoria de Pratos",
    href: "/plate-audit",
    icon: UtensilsCrossed,
  },
  {
    name: "Auditoria de Limpeza",
    href: "/cleaning-audit",
    icon: SprayCanIcon,
  },
  {
    name: "Verificacao de EPI",
    href: "/epi-check",
    icon: HardHat,
  },
  {
    name: "Leitor NFS-e",
    href: "/nfse-reader",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <ChefHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              Kitchen Monitor
            </span>
            <span className="text-xs text-muted-foreground">Plataforma IA</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-3">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-2 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Theme & Logout */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground bg-transparent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
