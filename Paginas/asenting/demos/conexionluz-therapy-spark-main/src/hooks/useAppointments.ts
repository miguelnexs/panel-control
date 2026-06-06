
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateAppointmentData {
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_age?: number;
  emergency_contact?: string;
  emergency_phone?: string;
  reason: string;
  therapist_id: string;
  service_id?: string;
  appointment_date: string;
  appointment_time: string;
}

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      console.log('Creating appointment with data:', data);
      
      // Primero crear o buscar el paciente
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('email', data.patient_email)
        .single();

      let patientId: string;

      if (existingPatient) {
        patientId = existingPatient.id;
        console.log('Updating existing patient:', patientId);
        
        // Actualizar datos del paciente si ya existe
        const { error: updateError } = await supabase
          .from('patients')
          .update({
            name: data.patient_name,
            phone: data.patient_phone,
            age: data.patient_age,
            emergency_contact: data.emergency_contact,
            emergency_phone: data.emergency_phone,
            medical_history: data.reason,
            updated_at: new Date().toISOString()
          })
          .eq('id', patientId);

        if (updateError) {
          console.error('Error updating patient:', updateError);
          throw updateError;
        }
      } else {
        console.log('Creating new patient');
        
        // Crear nuevo paciente
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            name: data.patient_name,
            email: data.patient_email,
            phone: data.patient_phone,
            age: data.patient_age,
            emergency_contact: data.emergency_contact,
            emergency_phone: data.emergency_phone,
            medical_history: data.reason
          })
          .select('id')
          .single();

        if (patientError) {
          console.error('Error creating patient:', patientError);
          throw patientError;
        }
        
        patientId = newPatient.id;
        console.log('Created new patient with ID:', patientId);
      }

      // Crear la cita
      console.log('Creating appointment for patient:', patientId);
      
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          therapist_id: data.therapist_id,
          service_id: data.service_id,
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          notes: data.reason,
          status: 'pending'
        })
        .select('*')
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        throw appointmentError;
      }

      console.log('Created appointment:', appointment);
      return appointment;
    },
    onSuccess: () => {
      console.log('Appointment created successfully');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (error) => {
      console.error('Failed to create appointment:', error);
    }
  });
};
