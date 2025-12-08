'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Droplets, Package, FileText } from "lucide-react"

interface QuickActionsProps {
    onOpenReportes: () => void;
}

export function QuickActions({ onOpenReportes }: QuickActionsProps) {
    const router = useRouter();

    const actions = [
        {
            label: 'Registrar Nueva Muestra',
            icon: Droplets,
            color: 'bg-brand-500 hover:bg-brand-700',
            onClick: () => router.push('/dashboard/admin/muestras'),
        },
        {
            label: 'Agregar Paciente',
            icon: Users,
            color: 'bg-green-600 hover:bg-green-700',
            onClick: () => router.push('/dashboard/admin/pacientes'),
        },
        {
            label: 'Actualizar Inventario',
            icon: Package,
            color: 'bg-purple-600 hover:bg-purple-700',
            onClick: () => router.push('/dashboard/admin/inventario'),
        },
        {
            label: 'Generar Reportes',
            icon: FileText,
            color: 'bg-orange-600 hover:bg-orange-700',
            onClick: () => router.push('/dashboard/admin/reportes'),
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Acceso rápido a funciones principales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {actions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                        <Button
                            key={i}
                            onClick={action.onClick}
                            className={`w-full ${action.color} text-white`}
                            size="lg"
                        >
                            <Icon className="mr-2 h-5 w-5" />
                            {action.label}
                        </Button>
                    );
                })}
            </CardContent>
        </Card>
    );
}
