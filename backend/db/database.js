import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = await open({
  
  filename: path.join(__dirname, 'calendario.db'),
  driver: sqlite3.Database
});

await db.exec(`
  CREATE INDEX IF NOT EXISTS idx_eventos_salon_fecha
  ON eventos (id_salon, fecha_inicio, fecha_fin);
`);


export default db;