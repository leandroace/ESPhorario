import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import db from './db/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', apiRoutes);

// Crear base si no existe
const schema = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf-8');
await db.exec(schema);

if (!fs.existsSync(path.join(__dirname, 'db/calendario.db.seeded'))) {
  const seed = fs.readFileSync(path.join(__dirname, 'db/seed.sql'), 'utf-8');
  await db.exec(seed);
  fs.writeFileSync(path.join(__dirname, 'db/calendario.db.seeded'), 'ok');
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});