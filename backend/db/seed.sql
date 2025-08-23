INSERT INTO salones (nombre, capacidad) VALUES
('Salón 1', 50),
('Salón 2', 30);

INSERT INTO eventos (id_salon, titulo, encargado, fecha_inicio, fecha_fin, repeticion, cupo, color) VALUES
(1, 'Clase de Cálculo', 'Prof. Ana Ruiz', '2025-07-18T09:00:00', '2025-07-18T11:00:00', 'no', 45),
(1, 'Seminario de Economía', 'Dr. Pérez', '2025-07-19T14:00:00', '2025-07-19T16:00:00', 'semanal', 35),
(2, 'Taller de Lectura', 'Lic. Gómez', '2025-07-18T10:00:00', '2025-07-18T12:00:00', 'no', 25);

INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES
('Admin Sistemas', 'sistemas.esp@correounivalle.edu.co', 'admin123', 'admin'),
('Invitado', 'invitado@correounivalle.edu.co', '1234', 'invitado');
