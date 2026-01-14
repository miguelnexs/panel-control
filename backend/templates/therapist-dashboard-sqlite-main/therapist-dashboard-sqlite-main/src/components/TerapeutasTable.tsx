
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Mail, Phone, CheckCircle, XCircle, UserPlus, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import AddTerapeutaForm from './AddTerapeutaForm';

const TerapeutasTable = () => {
  const [terapeutas, setTerapeutas] = useState([
    {
      id: 1,
      nombre: "Dr. Ana García López",
      especialidad: "Psicología Clínica",
      correo: "ana.garcia@clinica.com",
      telefono: "+34 600 123 456",
      estado_activo: true,
      pacientes: 3
    },
    {
      id: 2,
      nombre: "Dr. Carlos Mendoza Silva",
      especialidad: "Terapia Familiar",
      correo: "carlos.mendoza@clinica.com",
      telefono: "+34 600 789 012",
      estado_activo: true,
      pacientes: 2
    },
    {
      id: 3,
      nombre: "Dra. María Fernández Torres",
      especialidad: "Psicología Infantil",
      correo: "maria.fernandez@clinica.com",
      telefono: "+34 600 345 678",
      estado_activo: true,
      pacientes: 2
    },
    {
      id: 4,
      nombre: "Dr. Luis Rodríguez Vega",
      especialidad: "Terapia Cognitivo-Conductual",
      correo: "luis.rodriguez@clinica.com",
      telefono: "+34 600 901 234",
      estado_activo: false,
      pacientes: 0
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleTerapeutaAdded = (newTerapeuta: any) => {
    setTerapeutas(prev => [...prev, { ...newTerapeuta, pacientes: 0 }]);
    setIsDialogOpen(false);
  };

  const handleDeleteTerapeuta = (id: number, nombre: string) => {
    const terapeuta = terapeutas.find(t => t.id === id);
    
    if (terapeuta && terapeuta.pacientes > 0) {
      toast({
        title: "No se puede eliminar",
        description: `${nombre} tiene pacientes asignados. Reasigne los pacientes antes de eliminar.`,
        variant: "destructive",
      });
      return;
    }

    setTerapeutas(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Terapeuta eliminado",
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
              Terapeutas Registrados
            </CardTitle>
            <CardDescription>
              Lista completa de terapeutas en el sistema
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Agregar Terapeuta
              </Button>
            </DialogTrigger>
            <AddTerapeutaForm 
              onClose={() => setIsDialogOpen(false)}
              onTerapeutaAdded={handleTerapeutaAdded}
            />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {terapeutas.map((terapeuta) => (
            <div 
              key={terapeuta.id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {terapeuta.nombre}
                  </h3>
                  <Badge 
                    variant={terapeuta.estado_activo ? "default" : "secondary"}
                    className={terapeuta.estado_activo ? "bg-green-100 text-green-800" : ""}
                  >
                    {terapeuta.estado_activo ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Activo</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> Inactivo</>
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Especialidad:</strong> {terapeuta.especialidad}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {terapeuta.correo}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {terapeuta.telefono}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {terapeuta.pacientes}
                  </div>
                  <div className="text-xs text-gray-500">
                    pacientes
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
                      <AlertDialogTitle>¿Eliminar terapeuta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará permanentemente a <strong>{terapeuta.nombre}</strong> del sistema.
                        {terapeuta.pacientes > 0 && (
                          <span className="text-red-600 block mt-2">
                            ⚠️ Este terapeuta tiene {terapeuta.pacientes} paciente(s) asignado(s).
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteTerapeuta(terapeuta.id, terapeuta.nombre)}
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

export default TerapeutasTable;
