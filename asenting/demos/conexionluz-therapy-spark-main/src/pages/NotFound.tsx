
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center space-y-8 animate-fade-in">
        <div className="w-32 h-32 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto animate-pulse-slow">
          <span className="text-6xl font-bold text-white">404</span>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">Página no encontrada</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            La página que buscas no existe. Puedes regresar al inicio o agendar una consulta.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-primary to-accent text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Ir al Inicio</span>
          </button>
          
          <button
            onClick={() => navigate('/agenda')}
            className="bg-white border-2 border-primary text-primary px-8 py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
