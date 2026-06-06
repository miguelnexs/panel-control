
import React from 'react';
import PacientesTable from '@/components/PacientesTable';

const Pacientes = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">
          Gestión de Pacientes
        </h1>
        <p className="text-muted-foreground">
          Administra la información de todos los pacientes en tratamiento
        </p>
      </div>
      
      <PacientesTable />
    </div>
  );
};

export default Pacientes;
