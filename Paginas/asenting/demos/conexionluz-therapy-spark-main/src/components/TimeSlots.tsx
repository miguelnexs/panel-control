
import React, { useEffect, useState } from 'react';
import { Clock, Coffee, Sun, Moon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TimeSlotsProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  selectedDate: Date | null;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({ selectedTime, onTimeSelect, selectedDate }) => {
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const timeSlots = {
    morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
    afternoon: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
    evening: ['18:00', '18:30', '19:00', '19:30']
  };

  useEffect(() => {
    if (selectedDate) {
      fetchOccupiedTimes();
    }
  }, [selectedDate]);

  const fetchOccupiedTimes = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', dateString)
        .in('status', ['pending', 'confirmed']);

      if (error) {
        console.error('Error fetching appointments:', error);
        return;
      }

      const occupied = appointments?.map(app => app.appointment_time) || [];
      setOccupiedTimes(occupied);
    } catch (error) {
      console.error('Error fetching occupied times:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'morning': return Sun;
      case 'afternoon': return Coffee;
      case 'evening': return Moon;
      default: return Clock;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'morning': return 'Mañana';
      case 'afternoon': return 'Tarde';
      case 'evening': return 'Noche';
      default: return '';
    }
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'morning': return 'from-yellow-400 to-orange-400';
      case 'afternoon': return 'from-blue-400 to-indigo-400';
      case 'evening': return 'from-purple-400 to-pink-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const isTimeOccupied = (time: string) => {
    return occupiedTimes.includes(time);
  };

  if (!selectedDate) {
    return (
      <div className="text-center py-12">
        <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">
          Primero selecciona una fecha para ver los horarios disponibles
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-spin" />
        <p className="text-gray-500 text-lg">
          Cargando horarios disponibles...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Horarios disponibles para {selectedDate.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric',
            month: 'long'
          })}
        </h3>
        <p className="text-gray-600">Selecciona el horario que mejor te convenga</p>
      </div>

      {Object.entries(timeSlots).map(([period, times], index) => {
        const Icon = getPeriodIcon(period);
        const label = getPeriodLabel(period);
        const colorClass = getPeriodColor(period);

        return (
          <div 
            key={period} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center mb-4">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center mr-3`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">{label}</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {times.map((time, timeIndex) => {
                const isOccupied = isTimeOccupied(time);
                const isSelected = selectedTime === time;
                
                return (
                  <button
                    key={time}
                    onClick={() => !isOccupied && onTimeSelect(time)}
                    disabled={isOccupied}
                    className={`
                      p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 hover:shadow-md
                      animate-fade-in
                      ${isSelected && !isOccupied
                        ? `bg-gradient-to-r ${colorClass} text-white shadow-lg animate-pulse-slow`
                        : isOccupied
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-200'
                      }
                    `}
                    style={{ animationDelay: `${(index * 0.1) + (timeIndex * 0.05)}s` }}
                  >
                    <Clock className="h-4 w-4 mx-auto mb-1" />
                    <div className="font-semibold">{time}</div>
                    <div className="text-xs opacity-75">
                      {isOccupied ? 'Ocupado' : 'Disponible'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {selectedTime && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 animate-scale-in">
          <div className="flex items-center text-green-700">
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-semibold">
              Horario seleccionado: {selectedTime}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlots;
