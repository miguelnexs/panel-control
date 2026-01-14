import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, User, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from '../components/DatePicker';
import TimeSlots from '../components/TimeSlots';
import PatientForm from '../components/PatientForm';
import { useCreateAppointment } from '../hooks/useAppointments';
import { useToast } from '../hooks/use-toast';

interface AgendaStep {
  id: number;
  title: string;
  icon: React.ElementType;
  completed: boolean;
}

const Agenda = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createAppointmentMutation = useCreateAppointment();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [patientData, setPatientData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    emergency_contact: '',
    emergency_phone: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: AgendaStep[] = [
    { id: 1, title: 'Seleccionar Fecha', icon: Calendar, completed: !!selectedDate },
    { id: 2, title: 'Elegir Horario', icon: Clock, completed: !!selectedTime },
    { id: 3, title: 'Datos Personales', icon: User, completed: false },
    { id: 4, title: 'Confirmación', icon: CheckCircle, completed: false }
  ];

  const handleNext = async () => {
    if (currentStep === 3 && isStepValid()) {
      // Crear la cita en la base de datos
      setIsSubmitting(true);
      try {
        // Obtener el primer terapeuta disponible (puedes modificar esta lógica)
        const therapistId = "b5c8d2e1-3f4a-4b5c-8d9e-1f2a3b4c5d6e"; // ID del Dr. Ana María González
        
        await createAppointmentMutation.mutateAsync({
          patient_name: patientData.name,
          patient_email: patientData.email,
          patient_phone: patientData.phone,
          patient_age: patientData.age ? parseInt(patientData.age) : undefined,
          emergency_contact: patientData.emergency_contact || undefined,
          emergency_phone: patientData.emergency_phone || undefined,
          reason: patientData.reason,
          therapist_id: therapistId,
          appointment_date: selectedDate!.toISOString().split('T')[0],
          appointment_time: selectedTime
        });

        toast({
          title: "¡Cita agendada exitosamente!",
          description: "Tu cita ha sido registrada en nuestro sistema.",
        });

        setCurrentStep(4);
      } catch (error) {
        console.error('Error creating appointment:', error);
        toast({
          title: "Error al agendar la cita",
          description: "Hubo un problema al guardar tu cita. Por favor intenta nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return !!selectedDate;
      case 2: return !!selectedTime;
      case 3: return patientData.name && patientData.email && patientData.phone;
      default: return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <DatePicker 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate}
          />
        );
      case 2:
        return (
          <TimeSlots 
            selectedTime={selectedTime} 
            onTimeSelect={setSelectedTime}
            selectedDate={selectedDate}
          />
        );
      case 3:
        return (
          <PatientForm 
            data={patientData} 
            onChange={setPatientData}
          />
        );
      case 4:
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-scale-in">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">¡Cita Agendada!</h3>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 space-y-3">
              <p className="text-gray-600">
                <strong>Fecha:</strong> {selectedDate?.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-gray-600">
                <strong>Hora:</strong> {selectedTime}
              </p>
              <p className="text-gray-600">
                <strong>Paciente:</strong> {patientData.name}
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-primary to-accent text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Volver al Inicio
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Agendar Consulta
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 transform
                  ${currentStep >= step.id 
                    ? 'bg-gradient-to-r from-primary to-accent border-white text-white scale-110 animate-pulse-slow' 
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className={`
                  mt-2 text-sm font-medium transition-colors duration-300
                  ${currentStep >= step.id ? 'text-primary' : 'text-gray-500'}
                `}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {steps[currentStep - 1].title}
              </h2>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="mb-8">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`
                    px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105
                    ${currentStep === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                    }
                  `}
                >
                  Anterior
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!isStepValid() || isSubmitting}
                  className={`
                    px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105
                    ${isStepValid() && !isSubmitting
                      ? 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isSubmitting ? 'Guardando...' : (currentStep === 3 ? 'Confirmar Cita' : 'Siguiente')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
