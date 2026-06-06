
-- Crear tabla de terapeutas
CREATE TABLE public.therapists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  years_experience INTEGER DEFAULT 0,
  description TEXT,
  certifications TEXT[],
  price_from INTEGER DEFAULT 0,
  session_duration INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de servicios
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price_from INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 50,
  features TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de pacientes/contactos
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  age INTEGER,
  emergency_contact TEXT,
  emergency_phone TEXT,
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de citas
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) NOT NULL,
  therapist_id UUID REFERENCES public.therapists(id) NOT NULL,
  service_id UUID REFERENCES public.services(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar datos de terapeutas
INSERT INTO public.therapists (name, specialty, image_url, rating, years_experience, description, certifications, price_from, session_duration) VALUES
('Dr. Ana María González', 'Psicología Clínica', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face', 4.9, 12, 'Especialista en terapia cognitivo-conductual con enfoque en ansiedad y depresión. Ayudo a mis pacientes a encontrar herramientas para una vida más equilibrada.', ARRAY['CBT', 'Mindfulness', 'Trauma'], 150000, 50),
('Lic. Carlos Mendoza', 'Terapia Familiar', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face', 4.8, 8, 'Me especializo en dinámicas familiares y terapia de pareja, creando espacios seguros para la comunicación y el crecimiento conjunto.', ARRAY['Sistémica', 'Pareja', 'Adolescentes'], 200000, 60),
('Dra. Isabel Rodríguez', 'Psicología Infantil', 'https://images.unsplash.com/photo-1594824804732-ca8db6485160?w=400&h=400&fit=crop&crop=face', 5.0, 15, 'Trabajo con niños y adolescentes utilizando técnicas lúdicas y creativas para facilitar la expresión emocional y el desarrollo saludable.', ARRAY['Ludoterapia', 'TEA', 'TDAH'], 250000, 60),
('Mtro. Diego Herrera', 'Adicciones', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face', 4.7, 10, 'Especialista en tratamiento de adicciones con enfoque integral, acompañando procesos de recuperación con compasión y profesionalismo.', ARRAY['Adicciones', 'Motivacional', 'Grupos'], 180000, 50),
('Lic. Patricia Vásquez', 'Terapia Gestalt', 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face', 4.9, 7, 'Utilizo la terapia Gestalt para ayudar a las personas a conectar con su presente y desarrollar mayor autoconciencia y autenticidad.', ARRAY['Gestalt', 'Emocional', 'Corporal'], 120000, 45),
('Dr. Roberto Silva', 'Neuropsicología', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face', 4.8, 14, 'Me enfoco en la evaluación y rehabilitación neuropsicológica, ayudando a pacientes con lesiones cerebrales y deterioro cognitivo.', ARRAY['Neuropsicología', 'Rehabilitación', 'Evaluación'], 100000, 40);

-- Insertar datos de servicios
INSERT INTO public.services (title, description, price_from, duration, features) VALUES
('Terapia Individual', 'Sesiones personalizadas para abordar ansiedad, depresión, estrés y crecimiento personal', 150000, 50, ARRAY['Evaluación inicial', 'Plan personalizado', 'Seguimiento continuo']),
('Terapia de Pareja', 'Fortalece tu relación mejorando la comunicación y resolviendo conflictos', 200000, 60, ARRAY['Comunicación efectiva', 'Resolución de conflictos', 'Intimidad emocional']),
('Terapia Familiar', 'Trabajamos con toda la familia para crear dinámicas más saludables', 250000, 60, ARRAY['Dinámicas familiares', 'Adolescentes', 'Crianza positiva']),
('Trauma y PTSD', 'Tratamiento especializado para superar experiencias traumáticas', 180000, 50, ARRAY['EMDR', 'Terapia somática', 'Técnicas de regulación']),
('Coaching de Vida', 'Alcanza tus metas y desarrolla tu máximo potencial personal y profesional', 120000, 45, ARRAY['Definición de objetivos', 'Estrategias de acción', 'Motivación sostenida']),
('Bienestar Mental', 'Programas integrales para mantener y mejorar tu salud mental', 100000, 40, ARRAY['Mindfulness', 'Técnicas de relajación', 'Prevención']);

-- Hacer las tablas públicas (sin autenticación)
ALTER TABLE public.therapists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
