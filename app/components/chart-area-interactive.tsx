'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartAreaInteractiveProps {
    data: any[];
    loading?: boolean;
}

export function ChartAreaInteractive({ data, loading = false }: ChartAreaInteractiveProps) {
    const [chartData, setChartData] = useState<any[]>([]);
    const [period, setPeriod] = useState(7); // 7, 30, 90 días

    useEffect(() => {
        processData();
    }, [data, period]);

    const processData = () => {
        if (!data) return;

        // Agrupar por fecha
        const groupedByDate: { [key: string]: number } = {};
        const today = new Date();

        // Inicializar últimos N días con 0
        for (let i = period - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            groupedByDate[dateStr] = 0;
        }

        // Contar muestras por fecha
        data.forEach((muestra: any) => {
            if (!muestra.fecha_toma) return;
            const fecha = new Date(muestra.fecha_toma).toISOString().split('T')[0];
            if (groupedByDate.hasOwnProperty(fecha)) {
                groupedByDate[fecha]++;
            }
        });

        // Convertir a array para el gráfico
        const formattedData = Object.keys(groupedByDate)
            .sort()
            .map(date => ({
                fecha: new Date(date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short'
                }),
                muestras: groupedByDate[date]
            }));

        setChartData(formattedData);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Tendencia de Muestras</CardTitle>
                        <CardDescription>
                            Muestras procesadas en los últimos {period} días
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPeriod(7)}
                            className={`px-3 py-1 rounded text-sm ${period === 7
                                ? 'bg-brand-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            7d
                        </button>
                        <button
                            onClick={() => setPeriod(30)}
                            className={`px-3 py-1 rounded text-sm ${period === 30
                                ? 'bg-brand-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            30d
                        </button>
                        <button
                            onClick={() => setPeriod(90)}
                            className={`px-3 py-1 rounded text-sm ${period === 90
                                ? 'bg-brand-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            90d
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center h-[300px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <p>No hay datos disponibles para este período</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorMuestras" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4B9B6E" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4B9B6E" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="fecha"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                style={{ fontSize: '12px' }}
                                allowDecimals={false}
                            />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="muestras"
                                stroke="#4B9B6E"
                                fillOpacity={1}
                                fill="url(#colorMuestras)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
