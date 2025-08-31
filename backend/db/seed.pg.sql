-- db/seed.pg.sql (con escapes Unicode)

INSERT INTO salones (nombre, capacidad, multimedia, novedades) VALUES
(E'Sal\u00F3n 1', 50, 'TV', ''),
(E'Sal\u00F3n 2', 30, 'Proyector', '');

INSERT INTO eventos (id_salon, titulo, encargado, fecha_inicio, fecha_fin, repeticion, cupo, color) VALUES
(1, E'Clase de C\u00E1lculo',    E'Prof. Ana Ruiz', '2025-07-18T09:00:00-05:00', '2025-07-18T11:00:00-05:00', 'no',      45, '#3b82f6'),
(1, E'Seminario de Econom\u00EDa', E'Dr. P\u00E9rez',  '2025-07-19T14:00:00-05:00', '2025-07-19T16:00:00-05:00', 'semanal', 35, '#3b82f6'),
(2, E'Taller de Lectura',       E'Lic. G\u00F3mez', '2025-07-18T10:00:00-05:00', '2025-07-18T12:00:00-05:00', 'no',      25, '#3b82f6');

INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
(E'Admin Sistemas', 'sistemas.esp@correounivalle.edu.co', 'admin123', 'admin'),
(E'Invitado',       'invitado@correounivalle.edu.co',     '1234',     'invitado');
