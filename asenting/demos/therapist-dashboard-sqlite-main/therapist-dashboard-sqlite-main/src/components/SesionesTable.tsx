
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, User, Clock } from 'lucide-react';

const SesionesTable = () => {
  const sesiones = [
    {
      id: 1,
      paciente: "Elena Martín Ruiz",
      fecha: "2024-11-14",
      tema: "Ansiedad laboral",
      notas: "Primera sesión. Paciente muestra síntomas de ansiedad relacionados con el trabajo. Se establecieron objetivos terapéuticos."
    },
    {
      id: 2,
      paciente: "Elena Martín Ruiz",
      fecha: "2024-11-21",
      tema: "Técnicas de relajación",
      notas: "Se enseñaron técnicas de respiración y relajación muscular. Paciente muestra buena receptividad."
    },
    {
      id: 3,
      paciente: "Elena Martín Ruiz",
      fecha: "2024-11-28",
      tema: "Reestructuración cognitiva",
      notas: "Trabajo en identificación de pensamientos automáticos negativos. Tarea para casa asignada."
    },
    {
      id: 4,
      paciente: "Javier Pérez Sánchez",
      fecha: "2024-11-16",
      tema: "Depresión post-divorcio",
      notas: "Evaluación inicial. Paciente atraviesa proceso de divorcio difícil. Síntomas depresivos moderados."
    },
    {
      id: 5,
      paciente: "Javier Pérez Sánchez",
      fecha: "2024-11-23",
      tema: "Procesamiento emocional",
      notas: "Trabajo en el procesamiento de la pérdida y el duelo. Paciente muestra progreso."
    },
    {
      id: 6,
      paciente: "Carmen López Díaz",
      fecha: "2024-11-15",
      tema: "Terapia de pareja",
      notas: "Primera sesión con la pareja. Problemas de comunicación identificados."
    },
    {
      id: 7,
      paciente: "Carmen López Díaz",
      fecha: "2024-11-22",
      tema: "Comunicación asertiva",
      notas: "Práctica de técnicas de comunicación asertiva. Buenos resultados en las tareas."
    },
    {
      id: 8,
      paciente: "Miguel Ángel Gómez",
      fecha: "2024-11-18",
      tema: "Ansiedad social",
      notas: "Evaluación de ansiedad social en contexto universitario. Plan de exposición gradual."
    },
    {
      id: 9,
      paciente: "Laura Jiménez Castro",
      fecha: "2024-11-20",
      tema: "Estrés postraumático",
      notas: "Primera sesión para TEPT tras accidente. Establecimiento de red de apoyo."
    },
    {
      id: 10,
      paciente: "Laura Jiménez Castro",
      fecha: "2024-11-27",
      tema: "EMDR sesión 1",
      notas: "Primera sesión de EMDR. Paciente tolera bien el procedimiento."
    },
    {
      id: 11,
      paciente: "Roberto Silva Moreno",
      fecha: "2024-11-17",
      tema: "Adicción al alcohol",
      notas: "Evaluación inicial de problemas con alcohol. Motivación al cambio presente."
    },
    {
      id: 12,
      paciente: "Isabel Torres Vega",
      fecha: "2024-11-19",
      tema: "Autoestima",
      notas: "Trabajo en autoestima y autoconcepto. Identificación de fortalezas personales."
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTopicColor = (tema: string) => {
    const colors = {
      'Ansiedad': 'bg-red-100 text-red-800',
      'Depresión': 'bg-blue-100 text-blue-800',
      'Terapia': 'bg-green-100 text-green-800',
      'Comunicación': 'bg-purple-100 text-purple-800',
      'Autoestima': 'bg-yellow-100 text-yellow-800',
      'Estrés': 'bg-orange-100 text-orange-800',
      'Adicción': 'bg-gray-100 text-gray-800',
      'EMDR': 'bg-indigo-100 text-indigo-800'
    };

    for (const [key, color] of Object.entries(colors)) {
      if (tema.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Sesiones Registradas
        </CardTitle>
        <CardDescription>
          Historial completo de sesiones terapéuticas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sesiones.map((sesion) => (
            <div 
              key={sesion.id} 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">
                      {sesion.paciente}
                    </h3>
                  </div>
                  <Badge className={getTopicColor(sesion.tema)}>
                    {sesion.tema}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {formatDate(sesion.fecha)}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  {sesion.notas}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SesionesTable;
