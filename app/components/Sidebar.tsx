"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import {
  LayoutDashboard,
  Users,
  Droplets,
  Package,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const usuario = Cookies.get("usuario")
    ? JSON.parse(Cookies.get("usuario")!)
    : null;
  const isAdmin = usuario?.rol === "admin";

  const links = isAdmin
    ? [
        {
          href: "/dashboard/admin",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/admin/pacientes",
          label: "Pacientes",
          icon: Users,
        },
        {
          href: "/dashboard/admin/muestras",
          label: "Muestras",
          icon: Droplets,
        },
        {
          href: "/dashboard/admin/inventario",
          label: "Inventario",
          icon: Package,
        },
      ]
    : [
        {
          href: "/dashboard/cliente",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ];
  // Menú para CLIENTE (solo muestras)
  const menuCliente = [
        {
      href: '/dashboard/cliente/muestras', 
          icon: Droplets,
      label: 'Mis Muestras', 
        },
      ];
  return (
    <aside className="hidden md:block w-64 bg-brand-900 text-white min-h-screen sticky top-16">
      <div className="p-6">
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-brand-500 text-white shadow-lg"
                    : "text-brand-100 hover:bg-brand-700 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
