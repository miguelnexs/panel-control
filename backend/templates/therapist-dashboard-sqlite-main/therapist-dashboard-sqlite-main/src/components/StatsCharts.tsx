
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Users, Calendar, TrendingUp, Activity } from 'lucide-react';

const StatsCharts = () => {
  // Data for charts
  const terapeutasPacientesData = [
    { nombre: "Dr. Ana García", pacientes: 3, sesiones: 6 },
    { nombre: "Dr. Carlos Mendoza", pacientes: 2, sesiones: 3 },
    { nombre: "Dra. María Fernández", pacientes: 2, sesiones: 3 },
    { nombre: "Dr. Luis Rodríguez", pacientes: 0, sesiones: 0 }
  ];

  const especialidadesData = [
    { name: "Psicología Clínica", value: 3, fill: "#3b82f6" },
    { name: "Terapia Familiar", value: 2, fill: "#10b981" },
    { name: "Psicología Infantil", value: 2, fill: "#f59e0b" },
    { name: "Terapia Cognitivo-Conductual", value: 1, fill: "#ef4444" }
  ];

  const sesionesMonthData = [
    { mes: "Oct", sesiones: 8 },
    { mes: "Nov", sesiones: 12 },
    { mes: "Dic", sesiones: 15 }
  ];

  const edadesPacientesData = [
    { rango: "18-25", cantidad: 2 },
    { rango: "26-35", cantidad: 3 },
    { rango: "36-45", cantidad: 2 }
  ];

  const chartConfig = {
    pacientes: {
      label: "Pacientes",
    },
    sesiones: {
      label: "Sesiones",
    },
  };

  return (
    <div className="space-y-6">
      {/* Row 1 - Therapists Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pacientes por Terapeuta
            </CardTitle>
            <CardDescription>
              Distribución de pacientes entre terapeutas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={terapeutasPacientesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nombre" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="pacientes" fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Especialidades
            </CardTitle>
            <CardDescription>
              Distribución por especialidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  data={especialidadesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {especialidadesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 - Sessions and Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sesiones por Mes
            </CardTitle>
            <CardDescription>
              Evolución de sesiones mensuales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={sesionesMonthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="sesiones" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Edades de Pacientes
            </CardTitle>
            <CardDescription>
              Distribución por rango de edad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={edadesPacientesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rango" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="cantidad" fill="#f59e0b" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsCharts;
