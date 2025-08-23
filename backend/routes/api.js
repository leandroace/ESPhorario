import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// ========================== LOGIN ==========================
router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;
  const usuario = await db.get(
    'SELECT * FROM usuarios WHERE correo = ? AND contraseña = ?',
    [correo, contraseña]
  );

  if (usuario) {
    res.json({
      mensaje: 'Acceso permitido',
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
    });
  } else {
    res.status(401).json({ mensaje: 'Credenciales incorrectas' });
  }
});

// ======================== SALONES ==========================

// Crear salón
router.post('/salones', async (req, res) => {
  const { rol, nombre, capacidad, multimedia, novedades } = req.body;

  if (rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No autorizado para crear salones' });
  }

  try {
    await db.run(
      `INSERT INTO salones (nombre, capacidad, multimedia, novedades)
       VALUES (?, ?, ?, ?)`,
      [nombre, capacidad, multimedia || '', novedades || '']
    );
    res.status(201).json({ mensaje: 'Salón creado exitosamente' });
  } catch (error) {
    console.error('Error al crear salón:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Obtener todos los salones
router.get('/salones', async (req, res) => {
  const salones = await db.all('SELECT * FROM salones');
  res.json(salones);
});

// Obtener un salón por ID
router.get('/salones/:id', async (req, res) => {
  try {
    const salon = await db.get('SELECT * FROM salones WHERE id = ?', [req.params.id]);

    if (salon) {
      res.json(salon);
    } else {
      res.status(404).json({ mensaje: 'Salón no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener salón por ID:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});


// Actualizar salón
router.put('/salones/:id', async (req, res) => {
  const { rol, nombre, capacidad } = req.body;

  if (rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No autorizado' });
  }

  await db.run(
    'UPDATE salones SET nombre = ?, capacidad = ? WHERE id = ?',
    [nombre, capacidad, req.params.id]
  );
  res.json({ mensaje: 'Salón actualizado' });
});

// Eliminar salón
router.delete('/salones/:id', async (req, res) => {
  const rol = req.query.rol;

  if (rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No autorizado' });
  }

  try {
    await db.run('DELETE FROM salones WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Salón eliminado' });
  } catch (error) {
    console.error('Error al eliminar salón:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ========================= EVENTOS =========================

// Crear evento
router.post('/eventos', async (req, res) => {
  const {
    rol,
    id_salon,
    titulo,
    encargado,
    fecha_inicio,
    fecha_fin,
    repeticion,
    cupo,
    color = '#3b82f6' // ← NUEVO
  } = req.body;

  if (rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No autorizado' });
  }

  try {
    await db.run(
      `INSERT INTO eventos (id_salon, titulo, encargado, fecha_inicio, fecha_fin, repeticion, cupo, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_salon, titulo, encargado, fecha_inicio, fecha_fin, repeticion, cupo, color]
    );
    res.status(201).json({ mensaje: 'Evento creado' });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Obtener todos los eventos
router.get('/eventos', async (req, res) => {
  const eventos = await db.all('SELECT * FROM eventos');
  res.json(eventos);
});

// Obtener un evento por ID
router.get('/eventos/:id', async (req, res) => {
  const evento = await db.get('SELECT * FROM eventos WHERE id = ?', [req.params.id]);

  if (evento) {
    res.json(evento);
  } else {
    res.status(404).json({ mensaje: 'Evento no encontrado' });
  }
});

// Obtener eventos por salón
router.get('/salones/:id_salon/eventos', async (req, res) => {
  const eventos = await db.all(
    'SELECT * FROM eventos WHERE id_salon = ?',
    [req.params.id_salon]
  );
  res.json(eventos);
});

// Editar evento
router.put('/eventos/:id', async (req, res) => {
  const {
    rol,
    titulo,
    encargado,
    fecha_inicio,
    fecha_fin,
    repeticion,
    cupo,
    color // ← NUEVO
  } = req.body;

  if (rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No autorizado' });
  }

  try {
    await db.run(
      `UPDATE eventos SET
        titulo = ?, encargado = ?, fecha_inicio = ?, fecha_fin = ?,
        repeticion = ?, cupo = ?, color = COALESCE(?, color)
       WHERE id = ?`,
      [titulo, encargado, fecha_inicio, fecha_fin, repeticion, cupo, color, req.params.id]
    );
    res.json({ mensaje: 'Evento actualizado' });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});


// Eliminar evento
router.delete('/eventos/:id', async (req, res) => {
  const rol = req.query.rol;

  if (rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No autorizado' });
  }

  await db.run('DELETE FROM eventos WHERE id = ?', [req.params.id]);
  res.json({ mensaje: 'Evento eliminado' });
});

// ====================== DISPONIBILIDAD =====================

router.post('/disponibilidad', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, cupo } = req.body;

    if (!fecha_inicio || !fecha_fin || !cupo) {
      return res.status(400).json({ mensaje: 'Faltan campos' });
    }

    // Regla de solapamiento:
    // e.inicio < fin_solicitado   &&   e.fin > inicio_solicitado
    // Usamos replace('T',' ') + julianday() para evitar problemas de formato.
    const sql = `
      SELECT s.id, s.nombre, s.capacidad, s.multimedia, s.novedades
      FROM salones s
      WHERE s.capacidad >= ?
        AND NOT EXISTS (
          SELECT 1
          FROM eventos e
          WHERE e.id_salon = s.id
            AND julianday(replace(e.fecha_inicio,'T',' ')) < julianday(replace(?, 'T',' '))
            AND julianday(replace(e.fecha_fin,'T',' '))   > julianday(replace(?, 'T',' '))
        )
      ORDER BY s.capacidad ASC
    `;

    const filas = await db.all(sql, [Number(cupo), fecha_fin, fecha_inicio]);
    res.json(filas);
  } catch (error) {
    console.error('Error en /disponibilidad:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

export default router;
