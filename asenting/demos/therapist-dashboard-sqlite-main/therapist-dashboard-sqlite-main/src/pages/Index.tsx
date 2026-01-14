
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, FileText, Activity, TrendingUp, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardStats from '@/components/DashboardStats';
import StatsCharts from '@/components/StatsCharts';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard Principal
            </h1>
            <p className="text-muted-foreground">
              Resumen completo de tu consultorio de terapia
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Sistema Activo
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-16 bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/terapeutas')}
            >
              <div className="flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <span>Gestionar Terapeutas</span>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 border-blue-200 hover:bg-blue-50"
              onClick={() => navigate('/pacientes')}
            >
              <div className="flex flex-col items-center gap-2">
                <UserCheck className="h-6 w-6" />
                <span>Gestionar Pacientes</span>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 border-blue-200 hover:bg-blue-50"
              onClick={() => navigate('/sesiones')}
            >
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-6 w-6" />
                <span>Ver Sesiones</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity and Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nueva sesión registrada - Elena Martín</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Paciente registrado - Isabel Torres</p>
                  <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sesión EMDR completada - Laura Jiménez</p>
                  <p className="text-xs text-muted-foreground">Ayer</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Sesiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Elena Martín Ruiz</p>
                  <p className="text-sm text-muted-foreground">Terapia Cognitivo-Conductual</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">14:00</p>
                  <p className="text-xs text-muted-foreground">Hoy</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Javier Pérez Sánchez</p>
                  <p className="text-sm text-muted-foreground">Terapia Individual</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">16:30</p>
                  <p className="text-xs text-muted-foreground">Mañana</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Carmen López Díaz</p>
                  <p className="text-sm text-muted-foreground">Terapia de Pareja</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">10:00</p>
                  <p className="text-xs text-muted-foreground">Viernes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumen Estadístico
          </CardTitle>
          <CardDescription>
            Vista general del rendimiento del consultorio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatsCharts />
        </CardContent>
      </Card>

      {/* Database Info Card */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader>
          <CardTitle className="text-emerald-900">
            🗄️ Base de Datos SQLite3 Configurada
          </CardTitle>
        </CardHeader>
        <CardContent className="text-emerald-800">
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Para inicializar la base de datos:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
              <li>Ejecuta: <code className="bg-emerald-100 px-2 py-1 rounded text-xs">python create_database.py</code></li>
              <li>Se generará: <code className="bg-emerald-100 px-2 py-1 rounded text-xs">dashboard_terapeutas.db</code></li>
              <li>Incluye: 4 terapeutas, 7 pacientes y 12 sesiones de ejemplo</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
