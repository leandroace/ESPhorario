// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import db from './db/database.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ===== Middleware
app.use(cors());           // Si quieres whitelist, pásame tus dominios y lo configuro
app.use(express.json());

// ===== Rutas API
app.use('/api', apiRoutes);

// ===== Inicialización DB (solo esquema, sin seed)
async function initDb() {
  try {
    // Usa un archivo de esquema para Postgres. Te dejo uno de ejemplo abajo como schema.pg.sql
    const schemaPath = path.join(__dirname, 'db', 'schema.pg.sql');
    const sql = await fs.readFile(schemaPath, 'utf-8');
    await db.exec(sql);
    console.log('[DB] Esquema aplicado correctamente.');
  } catch (err) {
    console.error('[DB] Error aplicando esquema:', err.message);
    // No salimos del proceso para permitir ver logs en plataformas PaaS
  }
}

await initDb();

// ===== Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});
