import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Droplets, Package, TrendingUp } from "lucide-react"

export interface DashboardStats {
    totalPacientes: number;
    totalMuestras: number;
    productosInventario: number;
    resultadosHoy: number;
}

interface SectionCardsProps {
    loading: boolean;
    stats: DashboardStats;
}

export function SectionCards({ loading, stats }: SectionCardsProps) {
    const cards = [
        {
            title: "Total Pacientes",
            value: stats.totalPacientes,
            description: "Pacientes registrados",
            icon: Users,
            color: "text-brand-600",
            bgColor: "bg-brand-100",
        },
        {
            title: "Total Muestras",
            value: stats.totalMuestras,
            description: "Muestras procesadas",
            icon: Droplets,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Productos",
            value: stats.productosInventario,
            description: "En inventario",
            icon: Package,
            color: "text-brand-600",
            bgColor: "bg-brand-100",
        },
        {
            title: "Resultados Hoy",
            value: stats.resultadosHoy,
            description: "Resultados entregados",
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-muted rounded w-24"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted rounded w-16"></div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <Card key={i} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {card.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${card.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })
            )}
        </div>
    );
}

