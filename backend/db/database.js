// database.js — versión PostgreSQL
import pkg from "pg";
const { Pool } = pkg;

// Lee la URL desde .env, ej:
// DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require
const isProd = process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Muchos PaaS (Render/Railway/Neon/Supabase) requieren SSL
  ssl: isProd ? { rejectUnauthorized: false } : false,
});

/**
 * Shim con una interfaz parecida a sqlite:
 *  - db.exec(sql)             -> pool.query(sql)
 *  - db.get(sql, params)      -> primera fila
 *  - db.all(sql, params)      -> todas las filas
 *  - db.run(sql, params)      -> resultado genérico (usa RETURNING para ids)
 *
 * Nota: en Postgres NO existe lastInsertRowid. Para obtener el id,
 * usa siempre "INSERT ... RETURNING id" y léelo del resultado.
 */
const db = {
  exec: async (sql) => pool.query(sql),
  get: async (sql, params = []) => {
    const { rows } = await pool.query(sql, params);
    return rows[0];
  },
  all: async (sql, params = []) => {
    const { rows } = await pool.query(sql, params);
    return rows;
  },
  run: async (sql, params = []) => {
    const res = await pool.query(sql, params);
    return { rowCount: res.rowCount };
  },
};

export default db;

// ====== Inicializaciones al arranque ======
// Crea el índice si la tabla existe (evita error si aún no has creado 'eventos')
await pool.query(`
DO $$
BEGIN
  IF to_regclass('public.eventos') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_eventos_salon_fecha
      ON public.eventos (id_salon, fecha_inicio, fecha_fin);
  END IF;
END
$$;
`);
