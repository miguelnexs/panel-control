
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Mail, Phone, User, UserPlus, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import AddPacienteForm from './AddPacienteForm';

const PacientesTable = () => {
  const [pacientes, setPacientes] = useState([
    {
      id: 1,
      nombre: "Elena Martín Ruiz",
      edad: 28,
      genero: "Femenino",
      correo: "elena.martin@email.com",
      telefono: "+34 678 123 456",
      terapeuta: "Dr. Ana García López",
      sesiones: 3
    },
    {
      id: 2,
      nombre: "Javier Pérez Sánchez",
      edad: 35,
      genero: "Masculino",
      correo: "javier.perez@email.com",
      telefono: "+34 678 789 012",
      terapeuta: "Dr. Ana García López",
      sesiones: 2
    },
    {
      id: 3,
      nombre: "Carmen López Díaz",
      edad: 42,
      genero: "Femenino",
      correo: "carmen.lopez@email.com",
      telefono: "+34 678 345 678",
      terapeuta: "Dr. Carlos Mendoza Silva",
      sesiones: 2
    },
    {
      id: 4,
      nombre: "Miguel Ángel Gómez",
      edad: 19,
      genero: "Masculino",
      correo: "miguel.gomez@email.com",
      telefono: "+34 678 901 234",
      terapeuta: "Dr. Carlos Mendoza Silva",
      sesiones: 1
    },
    {
      id: 5,
      nombre: "Laura Jiménez Castro",
      edad: 31,
      genero: "Femenino",
      correo: "laura.jimenez@email.com",
      telefono: "+34 678 567 890",
      terapeuta: "Dra. María Fernández Torres",
      sesiones: 2
    },
    {
      id: 6,
      nombre: "Roberto Silva Moreno",
      edad: 45,
      genero: "Masculino",
      correo: "roberto.silva@email.com",
      telefono: "+34 678 234 567",
      terapeuta: "Dra. María Fernández Torres",
      sesiones: 1
    },
    {
      id: 7,
      nombre: "Isabel Torres Vega",
      edad: 26,
      genero: "Femenino",
      correo: "isabel.torres@email.com",
      telefono: "+34 678 678 901",
      terapeuta: "Dr. Ana García López",
      sesiones: 1
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Lista de terapeutas disponibles
  const terapeutas = [
    { id: 1, nombre: "Dr. Ana García López", estado_activo: true },
    { id: 2, nombre: "Dr. Carlos Mendoza Silva", estado_activo: true },
    { id: 3, nombre: "Dra. María Fernández Torres", estado_activo: true },
    { id: 4, nombre: "Dr. Luis Rodríguez Vega", estado_activo: false }
  ];

  const handlePacienteAdded = (newPaciente: any) => {
    const terapeutaAsignado = terapeutas.find(t => t.id === newPaciente.id_terapeuta);
    setPacientes(prev => [...prev, { 
      ...newPaciente, 
      terapeuta: terapeutaAsignado?.nombre || "",
      sesiones: 0 
    }]);
    setIsDialogOpen(false);
  };

  const handleDeletePaciente = (id: number, nombre: string) => {
    const paciente = pacientes.find(p => p.id === id);
    
    if (paciente && paciente.sesiones > 0) {
      toast({
        title: "¿Eliminar paciente con sesiones?",
        description: `${nombre} tiene ${paciente.sesiones} sesión(es) registrada(s). Se eliminarán también.`,
      });
    }

    setPacientes(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Paciente eliminado",
      description: `${nombre} ha sido eliminado del sistema.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pacientes Registrados
            </CardTitle>
            <CardDescription>
              Lista completa de pacientes en tratamiento
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Agregar Paciente
              </Button>
            </DialogTrigger>
            <AddPacienteForm 
              onClose={() => setIsDialogOpen(false)}
              onPacienteAdded={handlePacienteAdded}
              terapeutas={terapeutas}
            />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pacientes.map((paciente) => (
            <div 
              key={paciente.id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {paciente.nombre}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {paciente.edad} años
                  </Badge>
                  <Badge 
                    variant="secondary"
                    className={paciente.genero === 'Femenino' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'}
                  >
                    <User className="h-3 w-3 mr-1" />
                    {paciente.genero}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Terapeuta asignado:</strong> {paciente.terapeuta}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {paciente.correo}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {paciente.telefono}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {paciente.sesiones}
                  </div>
                  <div className="text-xs text-gray-500">
                    sesiones
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará permanentemente a <strong>{paciente.nombre}</strong> del sistema.
                        {paciente.sesiones > 0 && (
                          <span className="text-orange-600 block mt-2">
                            ⚠️ Este paciente tiene {paciente.sesiones} sesión(es) registrada(s) que también se eliminarán.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeletePaciente(paciente.id, paciente.nombre)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PacientesTable;
