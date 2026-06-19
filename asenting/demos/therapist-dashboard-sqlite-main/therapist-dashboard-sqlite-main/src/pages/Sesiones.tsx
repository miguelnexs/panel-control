
import React from 'react';
import SesionesTable from '@/components/SesionesTable';

const Sesiones = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">
          Registro de Sesiones
        </h1>
        <p className="text-muted-foreground">
          Historial completo de todas las sesiones terapéuticas realizadas
        </p>
      </div>
      
      <SesionesTable />
    </div>
  );
};

export default Sesiones;
