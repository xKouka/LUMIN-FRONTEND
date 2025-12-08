'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Droplets, Package } from "lucide-react"

interface QuickSummaryProps {
    totalPacientes: number;
    totalMuestras: number;
    productosInventario: number;
}

export function QuickSummary({ totalPacientes, totalMuestras, productosInventario }: QuickSummaryProps) {
    const items = [
        {
            label: 'Pacientes Registrados',
            value: totalPacientes,
            icon: Users,
            color: 'text-brand-500',
            bgColor: 'bg-brand-50',
        },
        {
            label: 'Total Muestras',
            value: totalMuestras,
            icon: Droplets,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            label: 'Productos disponibles',
            value: productosInventario,
            icon: Package,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Resumen Rápido</CardTitle>
                <CardDescription>Vista general del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className={`flex items-center justify-between p-3 ${item.bgColor} rounded-lg`}>
                            <div className="flex items-center space-x-3">
                                <Icon className={`h-5 w-5 ${item.color}`} />
                                <span className="text-sm font-medium text-gray-700">
                                    {item.label}
                                </span>
                            </div>
                            <Badge variant="secondary" className="text-lg font-bold">
                                {item.value}
                            </Badge>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
