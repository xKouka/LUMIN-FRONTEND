import { Home, Users, Droplets, Package, FileText, Shield } from "lucide-react"
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [rol, setRol] = useState<string | null>(null);

    useEffect(() => {
        const usuarioJSON = Cookies.get('usuario');
        if (usuarioJSON) {
            try {
                const usuario = JSON.parse(usuarioJSON);
                setRol(usuario.rol);
            } catch (e) {
                console.error("Error parsing user cookie", e);
            }
        }
    }, []);

    let menuItems: any[] = [
        {
            title: "Dashboard",
            icon: Home,
            url: rol === 'cliente' ? "/dashboard/cliente" : (rol === 'super_admin' ? "/dashboard/super-admin" : "/dashboard/admin"),
        }
    ];

    if (rol === 'cliente') {
        menuItems.push({
            title: "Mi Cuenta",
            // @ts-ignore
            items: [
                {
                    title: "Mis Muestras",
                    icon: Droplets,
                    url: "/dashboard/cliente/muestras",
                }
            ]
        } as any);
    } else {
        // Menu para Admin y Super Admin
        menuItems.push(
            {
                title: "Gestión",
                // @ts-ignore
                items: [
                    {
                        title: "Pacientes",
                        icon: Users,
                        url: "/dashboard/admin/pacientes",
                    },
                    {
                        title: "Muestras",
                        icon: Droplets,
                        url: "/dashboard/admin/muestras",
                    },
                    {
                        title: "Inventario",
                        icon: Package,
                        url: "/dashboard/admin/inventario",
                    },
                ],
            } as any,
            {
                title: "Reportes",
                icon: FileText,
                url: "/dashboard/admin/reportes",
            } as any
        );

        if (rol === 'super_admin') {
            menuItems.push({
                title: "Administración",
                icon: Shield,
                url: "/dashboard/super-admin/usuarios",
            } as any);
        }
    }

    return (
        <Sidebar {...props} className="border-r-0">
            <SidebarHeader className="border-b border-brand-400 bg-brand-500 px-6 py-5">
                <h2 className="text-lg font-bold text-white">
                    Clínica Blanca Trinidad
                </h2>
                <p className="text-xs text-brand-50 mt-0.5">Sistema de Gestión</p>
            </SidebarHeader>
            <SidebarContent className="px-3 py-4 bg-brand-500">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {menuItems.map((item) => (
                                <div key={item.title}>
                                    {item.items ? (
                                        <div className="space-y-1 mt-4 first:mt-0">
                                            <SidebarGroupLabel className="text-sm font-semibold text-brand-50 px-3 py-2">
                                                {item.title}
                                            </SidebarGroupLabel>
                                            {item.items.map((subItem: any) => (
                                                <SidebarMenuItem key={subItem.title}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        className="text-white hover:bg-brand-700 hover:text-white font-medium transition-colors"
                                                    >
                                                        <a href={subItem.url} className="flex items-center gap-3 px-3 py-2.5 rounded-md">
                                                            <subItem.icon className="h-4 w-4" />
                                                            <span>{subItem.title}</span>
                                                        </a>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </div>
                                    ) : (
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild
                                                className="text-white hover:bg-brand-700 hover:text-white font-medium transition-colors"
                                            >
                                                <a href={item.url} className="flex items-center gap-3 px-3 py-2.5 rounded-md">
                                                    <item.icon className="h-4 w-4" />
                                                    {/* @ts-ignore */}
                                                    <span>{item.title}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )}
                                </div>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

