CREATE TABLE IF NOT EXISTS salones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  capacidad INTEGER NOT NULL,
  multimedia TEXT DEFAULT '',
  novedades TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_salon INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  encargado TEXT NOT NULL,
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT NOT NULL,
  repeticion TEXT DEFAULT 'no',
  cupo INTEGER NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  FOREIGN KEY(id_salon) REFERENCES salones(id)
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  contraseña TEXT NOT NULL,
  rol TEXT NOT NULL -- 'admin' o 'invitado'
);
