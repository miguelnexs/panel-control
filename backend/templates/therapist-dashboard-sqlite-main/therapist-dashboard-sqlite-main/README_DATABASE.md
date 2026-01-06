
# Dashboard de Terapeutas - Base de Datos SQLite3

## Descripción
Este proyecto incluye una base de datos SQLite3 completa para un sistema de dashboard de terapeutas, con tablas para terapeutas, pacientes y sesiones.

## Estructura de la Base de Datos

### Tabla: terapeutas
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `nombre` (TEXT) - Nombre completo del terapeuta
- `especialidad` (TEXT) - Área de especialización
- `correo` (TEXT UNIQUE) - Email único
- `telefono` (TEXT) - Número de teléfono
- `estado_activo` (BOOLEAN) - Si el terapeuta está activo

### Tabla: pacientes
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `nombre` (TEXT) - Nombre completo del paciente
- `edad` (INTEGER) - Edad del paciente
- `genero` (TEXT) - Género del paciente
- `correo` (TEXT) - Email del paciente
- `telefono` (TEXT) - Número de teléfono
- `id_terapeuta` (INTEGER, FOREIGN KEY) - Referencia al terapeuta asignado

### Tabla: sesiones
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `id_paciente` (INTEGER, FOREIGN KEY) - Referencia al paciente
- `fecha` (TEXT) - Fecha en formato ISO 8601
- `tema` (TEXT) - Tema principal de la sesión
- `notas` (TEXT) - Notas detalladas de la sesión

## Instalación y Uso

### Requisitos
- Python 3.6 o superior
- Biblioteca sqlite3 (incluida en Python por defecto)

### Generar la Base de Datos

1. Ejecuta el script de creación:
```bash
python create_database.py
```

2. Se creará el archivo `dashboard_terapeutas.db` con todos los datos de ejemplo.

### Datos de Ejemplo Incluidos

#### Terapeutas (4 registros):
- **Dr. Ana García López** - Psicología Clínica (Activo)
- **Dr. Carlos Mendoza Silva** - Terapia Familiar (Activo)
- **Dra. María Fernández Torres** - Psicología Infantil (Activo)
- **Dr. Luis Rodríguez Vega** - Terapia Cognitivo-Conductual (Inactivo)

#### Pacientes (7 registros):
- Elena Martín Ruiz (28 años, Femenino) - Asignada a Dr. Ana García
- Javier Pérez Sánchez (35 años, Masculino) - Asignado a Dr. Ana García
- Carmen López Díaz (42 años, Femenino) - Asignada a Dr. Carlos Mendoza
- Miguel Ángel Gómez (19 años, Masculino) - Asignado a Dr. Carlos Mendoza
- Laura Jiménez Castro (31 años, Femenino) - Asignada a Dra. María Fernández
- Roberto Silva Moreno (45 años, Masculino) - Asignado a Dra. María Fernández
- Isabel Torres Vega (26 años, Femenino) - Asignada a Dr. Ana García

#### Sesiones (12 registros):
- Diversas sesiones con temas como ansiedad laboral, depresión, terapia de pareja, etc.
- Fechas distribuidas en los últimos 30 días
- Notas detalladas para cada sesión

## Consultas SQL Útiles

### Obtener terapeutas activos con número de pacientes:
```sql
SELECT t.nombre, t.especialidad, COUNT(p.id) as num_pacientes
FROM terapeutas t
LEFT JOIN pacientes p ON t.id = p.id_terapeuta
WHERE t.estado_activo = 1
GROUP BY t.id, t.nombre, t.especialidad;
```

### Obtener sesiones de un paciente específico:
```sql
SELECT s.fecha, s.tema, s.notas
FROM sesiones s
JOIN pacientes p ON s.id_paciente = p.id
WHERE p.nombre = 'Elena Martín Ruiz'
ORDER BY s.fecha DESC;
```

### Estadísticas generales:
```sql
-- Total de sesiones por terapeuta
SELECT t.nombre, COUNT(s.id) as total_sesiones
FROM terapeutas t
JOIN pacientes p ON t.id = p.id_terapeuta
JOIN sesiones s ON p.id = s.id_paciente
GROUP BY t.id, t.nombre
ORDER BY total_sesiones DESC;
```

## Características de la Base de Datos

- ✅ Integridad referencial con Foreign Keys
- ✅ Datos realistas y variados
- ✅ Formato de fechas ISO 8601
- ✅ Restricciones de unicidad en emails
- ✅ Campo boolean para estado activo
- ✅ Datos de ejemplo completos y coherentes

## Conexión con el Frontend

El dashboard React muestra todos los datos de la base de datos de manera organizada:
- Vista de terapeutas con estadísticas
- Lista de pacientes con información detallada
- Historial de sesiones con filtros
- Estadísticas generales del consultorio

La interfaz es completamente responsive y utiliza componentes modernos de shadcn/ui.
