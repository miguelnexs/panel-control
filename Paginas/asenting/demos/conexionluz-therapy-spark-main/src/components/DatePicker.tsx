
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateDisabled = (date: Date) => {
    return date < today;
  };

  const nextThirtyDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  const handleQuickSelect = (date: Date) => {
    onDateSelect(date);
  };

  return (
    <div className="space-y-6">
      {/* Quick Select Dates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
          Fechas Disponibles
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {nextThirtyDays.map((date, index) => (
            <button
              key={index}
              onClick={() => handleQuickSelect(date)}
              className={`
                p-3 rounded-xl text-center transition-all duration-300 transform hover:scale-105 hover:shadow-md
                ${selectedDate?.toDateString() === date.toDateString()
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg animate-pulse-slow'
                  : 'bg-gray-50 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 text-gray-700'
                }
              `}
            >
              <div className="text-xs font-medium">
                {date.toLocaleDateString('es-ES', { weekday: 'short' })}
              </div>
              <div className="text-lg font-bold">
                {date.getDate()}
              </div>
              <div className="text-xs">
                {date.toLocaleDateString('es-ES', { month: 'short' })}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Component */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          O selecciona otra fecha
        </h3>
        <div className="bg-gray-50 rounded-xl p-4 animate-fade-in">
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={(date) => onDateSelect(date || null)}
            disabled={isDateDisabled}
            className="rounded-md border-0"
            month={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </div>
      </div>

      {selectedDate && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 animate-scale-in">
          <div className="flex items-center text-green-700">
            <CalendarIcon className="h-5 w-5 mr-2" />
            <span className="font-semibold">
              Fecha seleccionada: {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
