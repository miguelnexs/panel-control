
import React from 'react';
import TerapeutasTable from '@/components/TerapeutasTable';

const Terapeutas = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">
          Gestión de Terapeutas
        </h1>
        <p className="text-muted-foreground">
          Administra el equipo de profesionales de tu consultorio
        </p>
      </div>
      
      <TerapeutasTable />
    </div>
  );
};

export default Terapeutas;
