
import sqlite3
from datetime import datetime, timedelta
import os

def create_database():
    # Eliminar la base de datos existente si existe
    if os.path.exists('dashboard_terapeutas.db'):
        os.remove('dashboard_terapeutas.db')
    
    # Crear conexión a la base de datos
    conn = sqlite3.connect('dashboard_terapeutas.db')
    cursor = conn.cursor()
    
    # Crear tabla Terapeutas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS terapeutas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            especialidad TEXT NOT NULL,
            correo TEXT UNIQUE NOT NULL,
            telefono TEXT,
            estado_activo BOOLEAN DEFAULT 1
        )
    ''')
    
    # Crear tabla Pacientes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pacientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            edad INTEGER,
            genero TEXT,
            correo TEXT,
            telefono TEXT,
            id_terapeuta INTEGER,
            FOREIGN KEY (id_terapeuta) REFERENCES terapeutas (id)
        )
    ''')
    
    # Crear tabla Sesiones
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sesiones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_paciente INTEGER NOT NULL,
            fecha TEXT NOT NULL,
            tema TEXT,
            notas TEXT,
            FOREIGN KEY (id_paciente) REFERENCES pacientes (id)
        )
    ''')
    
    # Poblar con datos de ejemplo
    print("Poblando la base de datos con datos de ejemplo...")
    
    # Insertar terapeutas
    terapeutas_data = [
        ('Dr. Ana García López', 'Psicología Clínica', 'ana.garcia@clinica.com', '+34 600 123 456', 1),
        ('Dr. Carlos Mendoza Silva', 'Terapia Familiar', 'carlos.mendoza@clinica.com', '+34 600 789 012', 1),
        ('Dra. María Fernández Torres', 'Psicología Infantil', 'maria.fernandez@clinica.com', '+34 600 345 678', 1),
        ('Dr. Luis Rodríguez Vega', 'Terapia Cognitivo-Conductual', 'luis.rodriguez@clinica.com', '+34 600 901 234', 0)
    ]
    
    cursor.executemany('''
        INSERT INTO terapeutas (nombre, especialidad, correo, telefono, estado_activo)
        VALUES (?, ?, ?, ?, ?)
    ''', terapeutas_data)
    
    # Insertar pacientes
    pacientes_data = [
        ('Elena Martín Ruiz', 28, 'Femenino', 'elena.martin@email.com', '+34 678 123 456', 1),
        ('Javier Pérez Sánchez', 35, 'Masculino', 'javier.perez@email.com', '+34 678 789 012', 1),
        ('Carmen López Díaz', 42, 'Femenino', 'carmen.lopez@email.com', '+34 678 345 678', 2),
        ('Miguel Ángel Gómez', 19, 'Masculino', 'miguel.gomez@email.com', '+34 678 901 234', 2),
        ('Laura Jiménez Castro', 31, 'Femenino', 'laura.jimenez@email.com', '+34 678 567 890', 3),
        ('Roberto Silva Moreno', 45, 'Masculino', 'roberto.silva@email.com', '+34 678 234 567', 3),
        ('Isabel Torres Vega', 26, 'Femenino', 'isabel.torres@email.com', '+34 678 678 901', 1)
    ]
    
    cursor.executemany('''
        INSERT INTO pacientes (nombre, edad, genero, correo, telefono, id_terapeuta)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', pacientes_data)
    
    # Insertar sesiones
    base_date = datetime.now() - timedelta(days=30)
    sesiones_data = [
        (1, (base_date + timedelta(days=1)).isoformat(), 'Ansiedad laboral', 'Primera sesión. Paciente muestra síntomas de ansiedad relacionados con el trabajo. Se establecieron objetivos terapéuticos.'),
        (1, (base_date + timedelta(days=8)).isoformat(), 'Técnicas de relajación', 'Se enseñaron técnicas de respiración y relajación muscular. Paciente muestra buena receptividad.'),
        (1, (base_date + timedelta(days=15)).isoformat(), 'Reestructuración cognitiva', 'Trabajo en identificación de pensamientos automáticos negativos. Tarea para casa asignada.'),
        (2, (base_date + timedelta(days=3)).isoformat(), 'Depresión post-divorcio', 'Evaluación inicial. Paciente atraviesa proceso de divorcio difícil. Síntomas depresivos moderados.'),
        (2, (base_date + timedelta(days=10)).isoformat(), 'Procesamiento emocional', 'Trabajo en el procesamiento de la pérdida y el duelo. Paciente muestra progreso.'),
        (3, (base_date + timedelta(days=2)).isoformat(), 'Terapia de pareja', 'Primera sesión con la pareja. Problemas de comunicación identificados.'),
        (3, (base_date + timedelta(days=9)).isoformat(), 'Comunicación asertiva', 'Práctica de técnicas de comunicación asertiva. Buenos resultados en las tareas.'),
        (4, (base_date + timedelta(days=5)).isoformat(), 'Ansiedad social', 'Evaluación de ansiedad social en contexto universitario. Plan de exposición gradual.'),
        (5, (base_date + timedelta(days=7)).isoformat(), 'Estrés postraumático', 'Primera sesión para TEPT tras accidente. Establecimiento de red de apoyo.'),
        (5, (base_date + timedelta(days=14)).isoformat(), 'EMDR sesión 1', 'Primera sesión de EMDR. Paciente tolera bien el procedimiento.'),
        (6, (base_date + timedelta(days=4)).isoformat(), 'Adicción al alcohol', 'Evaluación inicial de problemas con alcohol. Motivación al cambio presente.'),
        (7, (base_date + timedelta(days=6)).isoformat(), 'Autoestima', 'Trabajo en autoestima y autoconcepto. Identificación de fortalezas personales.')
    ]
    
    cursor.executemany('''
        INSERT INTO sesiones (id_paciente, fecha, tema, notas)
        VALUES (?, ?, ?, ?)
    ''', sesiones_data)
    
    # Confirmar los cambios
    conn.commit()
    
    # Verificar que los datos se insertaron correctamente
    print("\n=== VERIFICACIÓN DE DATOS ===")
    
    cursor.execute("SELECT COUNT(*) FROM terapeutas")
    print(f"Terapeutas insertados: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM pacientes")
    print(f"Pacientes insertados: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM sesiones")
    print(f"Sesiones insertadas: {cursor.fetchone()[0]}")
    
    print("\n=== MUESTRA DE DATOS ===")
    
    # Mostrar algunos datos de ejemplo
    cursor.execute("""
        SELECT t.nombre, t.especialidad, COUNT(p.id) as num_pacientes
        FROM terapeutas t
        LEFT JOIN pacientes p ON t.id = p.id_terapeuta
        WHERE t.estado_activo = 1
        GROUP BY t.id, t.nombre, t.especialidad
    """)
    
    print("\nTerapeutas activos y número de pacientes:")
    for row in cursor.fetchall():
        print(f"- {row[0]} ({row[1]}): {row[2]} pacientes")
    
    cursor.execute("""
        SELECT p.nombre, COUNT(s.id) as num_sesiones
        FROM pacientes p
        LEFT JOIN sesiones s ON p.id = s.id_paciente
        GROUP BY p.id, p.nombre
        ORDER BY num_sesiones DESC
        LIMIT 5
    """)
    
    print("\nPacientes con más sesiones:")
    for row in cursor.fetchall():
        print(f"- {row[0]}: {row[1]} sesiones")
    
    # Cerrar conexión
    conn.close()
    
    print(f"\n✅ Base de datos 'dashboard_terapeutas.db' creada exitosamente!")
    print("La base de datos contiene todas las tablas con datos de ejemplo.")

if __name__ == "__main__":
    create_database()
