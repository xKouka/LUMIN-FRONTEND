'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { LogOut } from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import ConnectivityIndicator from './ConnectivityIndicator';

export function SiteHeader() {
    const router = useRouter();
    const usuario = Cookies.get('usuario') ? JSON.parse(Cookies.get('usuario')!) : null;

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('usuario');
        router.push('/login');
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-brand-500 px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 text-white hover:bg-brand-700" />
                <Separator orientation="vertical" className="mr-2 h-4 bg-brand-300" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-white font-semibold">Dashboard Admin</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-4">
                {/* Connectivity Indicator */}
                <ConnectivityIndicator />

                <Separator orientation="vertical" className="h-8 bg-brand-300" />

                <div className="hidden md:flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-brand-500 font-bold">
                        {usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-sm">
                        <p className="font-medium text-white">{usuario?.nombre}</p>
                        <p className="text-xs text-brand-50 capitalize">{usuario?.rol}</p>
                    </div>
                </div>
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-brand-700 hover:text-white"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Salir
                </Button>
            </div>
        </header>
    );
}

