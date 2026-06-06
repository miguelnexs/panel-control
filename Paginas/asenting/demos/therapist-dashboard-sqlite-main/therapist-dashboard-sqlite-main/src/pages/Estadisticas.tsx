
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from 'lucide-react';
import DashboardStats from '@/components/DashboardStats';
import StatsCharts from '@/components/StatsCharts';

const Estadisticas = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">
          Estadísticas y Análisis
        </h1>
        <p className="text-muted-foreground">
          Métricas detalladas del rendimiento y actividad de tu consultorio
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Charts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Análisis Detallado
          </CardTitle>
          <CardDescription>
            Gráficos y métricas avanzadas del consultorio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatsCharts />
        </CardContent>
      </Card>
    </div>
  );
};

export default Estadisticas;
