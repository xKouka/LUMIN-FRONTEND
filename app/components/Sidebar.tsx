"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import {
  LayoutDashboard,
  Users,
  Droplets,
  Package,
  Shield,
  FileText,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const usuario = Cookies.get("usuario")
    ? JSON.parse(Cookies.get("usuario")!)
    : null;
  const isAdmin = usuario?.rol === "admin";
  const isSuperAdmin = usuario?.rol === "super_admin";

  // Menú para SUPER ADMIN (todas las opciones)
  const menuSuperAdmin = [
    {
      href: "/dashboard/super-admin",
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
  ];

  // Menú para ADMIN
  const menuAdmin = [
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
    {
      href: "/dashboard/admin/reportes",
      label: "Reportes",
      icon: FileText,
    },
  ];

  // Menú para CLIENTE (solo muestras)
  const menuCliente = [
    {
      href: "/dashboard/cliente",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/cliente/muestras",
      label: "Mis Muestras",
      icon: Droplets,
    },
  ];

  // Seleccionar menú según rol
  const links = isSuperAdmin ? menuSuperAdmin : isAdmin ? menuAdmin : menuCliente;

  return (
    <aside className="hidden md:block w-64 bg-brand-900 text-white min-h-screen sticky top-16">
      <div className="p-6">
        {/* Indicador de rol para Super Admin */}
        {isSuperAdmin && (
          <div className="mb-4 p-3 bg-purple-700 rounded-lg flex items-center space-x-2">
            <Shield className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-semibold text-yellow-300">Super Admin</span>
          </div>
        )}

        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
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
