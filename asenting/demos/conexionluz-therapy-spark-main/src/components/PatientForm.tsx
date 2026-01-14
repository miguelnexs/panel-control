
import React from 'react';
import { User, Mail, Phone, MessageSquare, Users, Calendar } from 'lucide-react';

interface PatientData {
  name: string;
  email: string;
  phone: string;
  age: string;
  emergency_contact: string;
  emergency_phone: string;
  reason: string;
}

interface PatientFormProps {
  data: PatientData;
  onChange: (data: PatientData) => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof PatientData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const formFields = [
    {
      icon: User,
      label: 'Nombre completo',
      field: 'name' as keyof PatientData,
      type: 'text',
      placeholder: 'Ingresa tu nombre completo',
      required: true
    },
    {
      icon: Mail,
      label: 'Correo electrónico',
      field: 'email' as keyof PatientData,
      type: 'email',
      placeholder: 'ejemplo@correo.com',
      required: true
    },
    {
      icon: Phone,
      label: 'Número de teléfono',
      field: 'phone' as keyof PatientData,
      type: 'tel',
      placeholder: '+57 300 123 4567',
      required: true
    },
    {
      icon: Calendar,
      label: 'Edad',
      field: 'age' as keyof PatientData,
      type: 'number',
      placeholder: 'Tu edad',
      required: false
    },
    {
      icon: Users,
      label: 'Contacto de emergencia',
      field: 'emergency_contact' as keyof PatientData,
      type: 'text',
      placeholder: 'Nombre del contacto de emergencia',
      required: false
    },
    {
      icon: Phone,
      label: 'Teléfono de emergencia',
      field: 'emergency_phone' as keyof PatientData,
      type: 'tel',
      placeholder: '+57 300 123 4567',
      required: false
    },
    {
      icon: MessageSquare,
      label: 'Motivo de consulta / Historia médica',
      field: 'reason' as keyof PatientData,
      type: 'textarea',
      placeholder: 'Describe brevemente el motivo de tu consulta y cualquier información médica relevante...',
      required: true
    }
  ];

  const requiredFields = formFields.filter(field => field.required);
  const completedRequiredFields = requiredFields.filter(field => 
    data[field.field] && data[field.field].trim() !== ''
  ).length;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Información del Paciente
        </h3>
        <p className="text-gray-600">
          Completa tus datos para crear tu historial médico y confirmar la cita
        </p>
      </div>

      <div className="space-y-4">
        {formFields.map((field, index) => {
          const Icon = field.icon;
          const isTextarea = field.type === 'textarea';
          
          return (
            <div 
              key={field.field}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Icon className="h-4 w-4 mr-2 text-primary" />
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </div>
              </label>
              
              <div className="relative group">
                {isTextarea ? (
                  <textarea
                    value={data[field.field]}
                    onChange={(e) => handleChange(field.field, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className={`
                      w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 resize-none
                      focus:outline-none focus:ring-0 group-hover:border-primary/30
                      ${data[field.field] 
                        ? 'border-green-300 bg-green-50/50 focus:border-green-400' 
                        : 'border-gray-200 focus:border-primary bg-white hover:bg-gray-50'
                      }
                    `}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={data[field.field]}
                    onChange={(e) => handleChange(field.field, e.target.value)}
                    placeholder={field.placeholder}
                    min={field.type === 'number' ? '1' : undefined}
                    max={field.type === 'number' ? '120' : undefined}
                    className={`
                      w-full px-4 py-3 border-2 rounded-xl transition-all duration-300
                      focus:outline-none focus:ring-0 group-hover:border-primary/30
                      ${data[field.field] 
                        ? 'border-green-300 bg-green-50/50 focus:border-green-400' 
                        : 'border-gray-200 focus:border-primary bg-white hover:bg-gray-50'
                      }
                    `}
                  />
                )}
                
                {/* Success indicator */}
                {data[field.field] && field.required && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-scale-in">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progreso del formulario</span>
          <span>
            {completedRequiredFields} / {requiredFields.length} campos requeridos
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(completedRequiredFields / requiredFields.length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Information notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start">
          <svg className="flex-shrink-0 h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Historial Médico</h4>
            <p className="text-sm text-blue-700 mt-1">
              Esta información se guardará de forma segura en tu historial médico para brindar un mejor seguimiento en futuras consultas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
