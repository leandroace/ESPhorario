// routes/api.js (PostgreSQL)
import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// ========================== LOGIN ==========================
// VERSIÓN A (recomendada): columna contrasena (sin ñ)
router.post('/login', async (req, res) => {
  const { correo, contraseña, contrasena } = req.body;
  // Soporta ambos nombres desde el frontend; prioriza "contrasena"
  const pass = contrasena ?? contraseña;

  try {
    const usuario = await db.get(
      'SELECT id, nombre, rol FROM usuarios WHERE correo = $1 AND contrasena = $2',
      [correo, pass]
    );

    if (usuario) {
      res.json({
        mensaje: 'Acceso permitido',
        usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
      });
    } else {
      res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }
  } catch (err) {
    console.error('Error en /login:', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

/*
// VERSIÓN B (si mantuviste "contraseña" con ñ en la DB)
// OJO: debes tener "contraseña" entre comillas dobles en el SQL.
router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;
  try {
    const usuario = await db.get(
      'SELECT id, nombre, rol FROM usuarios WHERE correo = $1 AND "contraseña" = $2',
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
  } catch (err) {
    console.error('Error en /login:', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});
*/

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
       VALUES ($1, $2, COALESCE($3, ''), COALESCE($4, ''))`,
      [nombre, capacidad, multimedia, novedades]
    );
    res.status(201).json({ mensaje: 'Salón creado exitosamente' });
  } catch (error) {
    console.error('Error al crear salón:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Obtener todos los salones
router.get('/salones', async (req, res) => {
  try {
    const salones = await db.all('SELECT * FROM salones');
    res.json(salones);
  } catch (err) {
    console.error('Error al listar salones:', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Obtener un salón por ID
router.get('/salones/:id', async (req, res) => {
  try {
    const salon = await db.get('SELECT * FROM salones WHERE id = $1', [req.params.id]);

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
  const { rol, nombre, capacidad, multimedia, novedades } = req.body;

  if (rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No autorizado' });
  }

  try {
    await db.run(
      `UPDATE salones
         SET nombre = $1,
             capacidad = $2,
             multimedia = COALESCE($3, multimedia),
             novedades = COALESCE($4, novedades)
       WHERE id = $5`,
      [nombre, capacidad, multimedia, novedades, req.params.id]
    );
    res.json({ mensaje: 'Salón actualizado' });
  } catch (err) {
    console.error('Error al actualizar salón:', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Eliminar salón
router.delete('/salones/:id', async (req, res) => {
  const rol = req.query.rol;

  if (rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No autorizado' });
  }

  try {
    await db.run('DELETE FROM salones WHERE id = $1', [req.params.id]);
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
    color
  } = req.body;

  if (rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No autorizado' });
  }

  try {
    await db.run(
      `INSERT INTO eventos (id_salon, titulo, encargado, fecha_inicio, fecha_fin, repeticion, cupo, color)
       VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, COALESCE($6, 'no'), $7, COALESCE($8, '#3b82f6'))`,
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
  try {
    const eventos = await db.all('SELECT * FROM eventos');
    res.json(eventos);
  } catch (err) {
    console.error('Error al listar eventos:', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Obtener un evento por ID
router.get('/eventos/:id', async (req, res) => {
  try {
    const evento = await db.get('SELECT * FROM eventos WHERE id = $1', [req.params.id]);

    if (evento) {
      res.json(evento);
    } else {
      res.status(404).json({ mensaje: 'Evento no encontrado' });
    }
  } catch (err) {
    console.error('Error al obtener evento:', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Obtener eventos por salón
router.get('/salones/:id_salon/eventos', async (req, res) => {
  try {
    const eventos = await db.all(
      'SELECT * FROM eventos WHERE id_salon = $1',
      [req.params.id_salon]
    );
    res.json(eventos);
  } catch (err) {
    console.error('Error al listar eventos por salón:', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
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
    color
  } = req.body;

  if (rol !== 'admin') {
    return res.status(403).json({ mensaje: 'No autorizado' });
  }

  try {
    await db.run(
      `UPDATE eventos SET
         titulo = $1,
         encargado = $2,
         fecha_inicio = $3::timestamptz,
         fecha_fin = $4::timestamptz,
         repeticion = $5,
         cupo = $6,
         color = COALESCE($7, color)
       WHERE id = $8`,
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

  try {
    await db.run('DELETE FROM eventos WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Evento eliminado' });
  } catch (err) {
    console.error('Error al eliminar evento:', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ====================== DISPONIBILIDAD (con recurrencias y tstzrange) =====================
router.post('/disponibilidad', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, cupo } = req.body;

    if (!fecha_inicio || !fecha_fin || !cupo) {
      return res.status(400).json({ mensaje: 'Faltan campos' });
    }
    const cupoNum = Number(cupo);
    if (Number.isNaN(cupoNum)) {
      return res.status(400).json({ mensaje: 'Cupo inválido' });
    }

    const sql = `
      WITH params AS (
        SELECT
          $1::timestamptz AS req_start,
          $2::timestamptz AS req_end
      ),
      req AS (
        SELECT tstzrange(req_start, req_end, '[)') AS r FROM params
      ),

      -- NO recurrentes
      no_recur_conflicts AS (
        SELECT e.id_salon
        FROM eventos e, req
        WHERE (e.repeticion IS NULL OR e.repeticion IN ('no','none','NONE','ninguna'))
          AND tstzrange(e.fecha_inicio, e.fecha_fin, '[)') && req.r
      ),

      -- Diaria
      daily_conflicts AS (
        SELECT e.id_salon
        FROM eventos e, params, req
        CROSS JOIN LATERAL generate_series(
          e.fecha_inicio,
          params.req_end,
          interval '1 day'
        ) gs(occ_start)
        WHERE e.repeticion IN ('diaria','daily','DAILY')
          AND e.fecha_inicio <= params.req_end
          AND tstzrange(gs.occ_start, gs.occ_start + (e.fecha_fin - e.fecha_inicio), '[)') && req.r
      ),

      -- Semanal (1 semana)
      weekly_conflicts AS (
        SELECT e.id_salon
        FROM eventos e, params, req
        CROSS JOIN LATERAL generate_series(
          e.fecha_inicio,
          params.req_end,
          interval '1 week'
        ) gs(occ_start)
        WHERE e.repeticion IN ('semanal','weekly','WEEKLY')
          AND e.fecha_inicio <= params.req_end
          AND tstzrange(gs.occ_start, gs.occ_start + (e.fecha_fin - e.fecha_inicio), '[)') && req.r
      ),

      -- Cada 2 semanas (14 días)
      biweekly_conflicts AS (
        SELECT e.id_salon
        FROM eventos e, params, req
        CROSS JOIN LATERAL generate_series(
          e.fecha_inicio,
          params.req_end,
          interval '2 weeks'
        ) gs(occ_start)
        WHERE e.repeticion IN ('cada_2_semanas','biweekly','2w','cada2','quincenal_14')
          AND e.fecha_inicio <= params.req_end
          AND tstzrange(gs.occ_start, gs.occ_start + (e.fecha_fin - e.fecha_inicio), '[)') && req.r
      ),

      -- Mensual
      monthly_conflicts AS (
        SELECT e.id_salon
        FROM eventos e, params, req
        CROSS JOIN LATERAL generate_series(
          e.fecha_inicio,
          params.req_end,
          interval '1 month'
        ) gs(occ_start)
        WHERE e.repeticion IN ('mensual','monthly','MONTHLY')
          AND e.fecha_inicio <= params.req_end
          AND tstzrange(gs.occ_start, gs.occ_start + (e.fecha_fin - e.fecha_inicio), '[)') && req.r
      ),

      conflicts AS (
        SELECT id_salon FROM no_recur_conflicts
        UNION SELECT id_salon FROM daily_conflicts
        UNION SELECT id_salon FROM weekly_conflicts
        UNION SELECT id_salon FROM biweekly_conflicts
        UNION SELECT id_salon FROM monthly_conflicts
      )

      SELECT s.id, s.nombre, s.capacidad, s.multimedia, s.novedades
      FROM salones s
      WHERE s.capacidad >= $3
        AND s.id NOT IN (SELECT id_salon FROM conflicts)
      ORDER BY s.nombre;
    `;

    const filas = await db.all(sql, [fecha_inicio, fecha_fin, cupoNum]);
    res.json(filas);
  } catch (error) {
    console.error('Error en /disponibilidad:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});


export default router;
