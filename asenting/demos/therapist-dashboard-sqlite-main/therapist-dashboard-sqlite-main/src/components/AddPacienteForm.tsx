
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface PacienteFormData {
  nombre: string;
  edad: number;
  genero: string;
  correo: string;
  telefono: string;
  id_terapeuta: number;
}

interface AddPacienteFormProps {
  onClose: () => void;
  onPacienteAdded: (paciente: PacienteFormData & { id: number }) => void;
  terapeutas: Array<{ id: number; nombre: string; estado_activo: boolean }>;
}

const AddPacienteForm = ({ onClose, onPacienteAdded, terapeutas }: AddPacienteFormProps) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PacienteFormData>();
  const { toast } = useToast();

  const terapeutasActivos = terapeutas.filter(t => t.estado_activo);

  const onSubmit = (data: PacienteFormData) => {
    // Simular creación de paciente
    const newPaciente = {
      ...data,
      id: Date.now() // ID temporal
    };
    
    onPacienteAdded(newPaciente);
    toast({
      title: "Paciente agregado",
      description: `${data.nombre} ha sido agregado exitosamente.`,
    });
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
        <DialogDescription>
          Ingresa los datos del nuevo paciente en el formulario.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre Completo</Label>
          <Input
            id="nombre"
            {...register("nombre", { required: "El nombre es requerido" })}
            placeholder="María García López"
          />
          {errors.nombre && (
            <p className="text-sm text-destructive">{errors.nombre.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edad">Edad</Label>
            <Input
              id="edad"
              type="number"
              {...register("edad", { 
                required: "La edad es requerida",
                min: { value: 1, message: "La edad debe ser mayor a 0" },
                max: { value: 120, message: "La edad debe ser menor a 120" }
              })}
              placeholder="25"
            />
            {errors.edad && (
              <p className="text-sm text-destructive">{errors.edad.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="genero">Género</Label>
            <Select onValueChange={(value) => setValue("genero", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            placeholder="maria.garcia@email.com"
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
            placeholder="+34 678 123 456"
          />
          {errors.telefono && (
            <p className="text-sm text-destructive">{errors.telefono.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="terapeuta">Terapeuta Asignado</Label>
          <Select onValueChange={(value) => setValue("id_terapeuta", parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un terapeuta" />
            </SelectTrigger>
            <SelectContent>
              {terapeutasActivos.map((terapeuta) => (
                <SelectItem key={terapeuta.id} value={terapeuta.id.toString()}>
                  {terapeuta.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Agregar Paciente
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddPacienteForm;
