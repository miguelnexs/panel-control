
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface TerapeutaFormData {
  nombre: string;
  especialidad: string;
  correo: string;
  telefono: string;
  estado_activo: boolean;
}

interface AddTerapeutaFormProps {
  onClose: () => void;
  onTerapeutaAdded: (terapeuta: TerapeutaFormData & { id: number }) => void;
}

const AddTerapeutaForm = ({ onClose, onTerapeutaAdded }: AddTerapeutaFormProps) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TerapeutaFormData>({
    defaultValues: {
      estado_activo: true
    }
  });
  const { toast } = useToast();

  const especialidades = [
    "Psicología Clínica",
    "Terapia Familiar",
    "Psicología Infantil",
    "Terapia Cognitivo-Conductual",
    "Psicología Forense",
    "Terapia de Pareja",
    "Psicología Organizacional"
  ];

  const onSubmit = (data: TerapeutaFormData) => {
    // Simular creación de terapeuta (en una app real, esto sería una llamada a la API)
    const newTerapeuta = {
      ...data,
      id: Date.now() // ID temporal
    };
    
    onTerapeutaAdded(newTerapeuta);
    toast({
      title: "Terapeuta agregado",
      description: `${data.nombre} ha sido agregado exitosamente.`,
    });
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Agregar Nuevo Terapeuta</DialogTitle>
        <DialogDescription>
          Ingresa los datos del nuevo terapeuta en el formulario.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre Completo</Label>
          <Input
            id="nombre"
            {...register("nombre", { required: "El nombre es requerido" })}
            placeholder="Dr. Juan Pérez"
          />
          {errors.nombre && (
            <p className="text-sm text-destructive">{errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="especialidad">Especialidad</Label>
          <Select onValueChange={(value) => setValue("especialidad", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una especialidad" />
            </SelectTrigger>
            <SelectContent>
              {especialidades.map((esp) => (
                <SelectItem key={esp} value={esp}>
                  {esp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="correo">Correo Electrónico</Label>
          <Input
            id="correo"
            type="email"
            {...register("correo", { 
              required: "El correo es requerido",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Formato de correo inválido"
              }
            })}
            placeholder="juan.perez@clinica.com"
          />
          {errors.correo && (
            <p className="text-sm text-destructive">{errors.correo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            {...register("telefono", { required: "El teléfono es requerido" })}
            placeholder="+34 600 123 456"
          />
          {errors.telefono && (
            <p className="text-sm text-destructive">{errors.telefono.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="estado_activo"
            checked={watch("estado_activo")}
            onCheckedChange={(checked) => setValue("estado_activo", checked)}
          />
          <Label htmlFor="estado_activo">Estado Activo</Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Agregar Terapeuta
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddTerapeutaForm;
