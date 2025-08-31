import { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { generarFormatoSolicitud } from '../utils/Generarformato';
Modal.setAppElement('#root'); // Evita warning de accesibilidad

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    backdropFilter: 'blur(2px)',
    zIndex: 999,
  },
  content: {
    inset: '50% auto auto 50%',
    transform: 'translate(-50%, -50%)',
    padding: 0,
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    width: 'min(720px, 92vw)',
    maxHeight: '85vh',
    overflow: 'hidden',
    background: '#ffffff',
    color: '#1e293b',
  },
};

// Paleta de colores predefinidos
const PALETTE = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#10b981', label: 'Verde' },
  { value: '#f59e0b', label: 'Ámbar' },
  { value: '#ef4444', label: 'Rojo' },
  { value: '#8b5cf6', label: 'Violeta' },
  { value: '#14b8a6', label: 'Turquesa' },
  { value: '#64748b', label: 'Gris' },
];

const s = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
  title: { fontSize: 18, fontWeight: 600, margin: 0 },
  close: { border: 'none', background: 'transparent', color: '#64748b', fontSize: 22, lineHeight: 1, padding: 4, borderRadius: 6, cursor: 'pointer' },
  body: { padding: 20, overflow: 'auto' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 },
  full: { gridColumn: '1 / -1' },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, color: '#475569', fontWeight: 500 },
  input: { height: 38, padding: '0 10px', borderRadius: 8, border: '1px solid #d1d5db', background: '#ffffff', color: '#1e293b', outline: 'none' },
  select: { height: 38, padding: '0 8px', borderRadius: 8, border: '1px solid #d1d5db', background: '#ffffff', color: '#1e293b', outline: 'none' },
  number: { height: 38, padding: '0 10px', borderRadius: 8, border: '1px solid #d1d5db', background: '#ffffff', color: '#1e293b', outline: 'none' },
  actionsRow: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  primaryBtn: { padding: '10px 16px', borderRadius: 8, border: '1px solid #2563eb', background: '#3b82f6', color: '#ffffff', fontWeight: 600, cursor: 'pointer' },
  secondaryBtn: { padding: '10px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f9fafb', color: '#1e293b', fontWeight: 500, cursor: 'pointer' },
  messageOk: { gridColumn: '1 / -1', padding: '10px 12px', borderRadius: 8, background: '#dcfce7', border: '1px solid #22c55e', color: '#166534', fontSize: 14 },
  messageErr: { gridColumn: '1 / -1', padding: '10px 12px', borderRadius: 8, background: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', fontSize: 14 },
  smallNote: { fontSize: 12, color: '#64748b', marginTop: 4, textAlign: 'right' },
};

function EventModal({ closeModal, salones, usuario, onCreateSuccess }) {
  const [titulo, setTitulo] = useState('');
  const [encargado, setEncargado] = useState('');
  const [idSalon, setIdSalon] = useState(salones[0]?.id || '');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [repeticion, setRepeticion] = useState('no');
  const [cupo, setCupo] = useState(1);
  const [color, setColor] = useState('#3b82f6'); // ← NUEVO
  const [mensaje, setMensaje] = useState('');
  const [ok, setOk] = useState(null);

  const handleDescargarFormato = async () => {
    const salonNombre = salones.find(s => String(s.id) === String(idSalon))?.nombre || `ID ${idSalon}`;

    await generarFormatoSolicitud({
      titulo,
      encargado,
      cupo,
      fechaInicio,
      fechaFin,
      salonNombre,

    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/eventos', {
        rol: usuario.rol,
        id_salon: idSalon,
        titulo,
        encargado,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        repeticion,
        cupo: Number(cupo),
        color, // ← NUEVO
      });

      onCreateSuccess?.();
      setOk(true);
      setMensaje('✅ Evento creado correctamente');
      setTimeout(() => { setMensaje(''); setOk(null); closeModal(); }, 700);
    } catch (err) {
      console.error(err);
      setOk(false);
      setMensaje('❌ Error al crear evento');
    }
  };

  return (
    <Modal isOpen onRequestClose={closeModal} style={modalStyles} contentLabel="Crear Evento">
      <div style={s.header}>
        <h2 style={s.title}>Nuevo evento</h2>
        <button aria-label="Cerrar" style={s.close} onClick={closeModal}>×</button>
      </div>

      <div style={s.body}>
        <form onSubmit={handleSubmit} style={s.form}>
          {mensaje && <div style={ok ? s.messageOk : s.messageErr}>{mensaje}</div>}

          {/* Salón */}
          <div style={s.field}>
            <label style={s.label}>Salón</label>
            <select value={idSalon} onChange={(e) => setIdSalon(e.target.value)} style={s.select} required>
              {salones.map((salon) => (
                <option key={salon.id} value={salon.id}>
                  {salon.nombre} — Capacidad: {salon.capacidad}
                </option>
              ))}
            </select>
          </div>

          {/* Cupo */}
          <div style={s.field}>
            <label style={s.label}>Cupo</label>
            <input type="number" min="1" value={cupo} onChange={(e) => setCupo(e.target.value)} style={s.number} required />
          </div>

          {/* Título */}
          <div style={{ ...s.field, ...s.full }}>
            <label style={s.label}>Título</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} style={s.input} placeholder="Ej: Clase de Matemáticas" required />
          </div>

          {/* Encargado */}
          <div style={s.field}>
            <label style={s.label}>Encargado</label>
            <input value={encargado} onChange={(e) => setEncargado(e.target.value)} style={s.input} placeholder="Nombre responsable" required />
          </div>

          {/* Repetición */}
          <div style={s.field}>
            <label style={s.label}>Repetición</label>
            <select value={repeticion} onChange={(e) => setRepeticion(e.target.value)} style={s.select}>
              <option value="no">No se repite</option>
              <option value="diaria">Cada día</option>
              <option value="semanal">Cada semana</option>
               <option value="cada_2_semanas">Cada 2 semanas </option>
            </select>
          </div>

          {/* Inicio */}
          <div style={s.field}>
            <label style={s.label}>Fecha y hora de inicio</label>
            <input type="datetime-local" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={s.input} required />
          </div>

          {/* Fin */}
          <div style={s.field}>
            <label style={s.label}>Fecha y hora de fin</label>
            <input type="datetime-local" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={s.input} required />
          </div>

          {/* Selector de color */}
          <div style={{ ...s.field, ...s.full }}>
            <label style={s.label}>Color del evento</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PALETTE.map(p => {
                const selected = color === p.value;
                return (
                  <button
                    type="button"
                    key={p.value}
                    onClick={() => setColor(p.value)}
                    title={p.label}
                    aria-label={p.label}
                    style={{
                      width: 28, height: 28,
                      borderRadius: 8,
                      border: selected ? '2px solid #0ea5e9' : '1px solid #d1d5db',
                      outline: 'none',
                      background: p.value,
                      cursor: 'pointer',
                      boxShadow: selected ? '0 0 0 3px rgba(14,165,233,0.15)' : 'none'
                    }}
                  />
                );
              })}
            </div>
            <div style={s.smallNote}>Se usará este color para pintar el evento en el calendario.</div>
          </div>

          {/* Botones */}
          <div style={{ ...s.actionsRow, ...s.full }}>

            <button
              type="button"
              onClick={handleDescargarFormato}
              style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f3f4f6', color: '#111827', fontWeight: 500, cursor: 'pointer' }}
            >
              Descargar formato
            </button>
            <button type="button" onClick={closeModal} style={s.secondaryBtn}>Cancelar</button>
            <button type="submit" style={s.primaryBtn}>Crear evento</button>
          </div>

          <div style={s.full}><span style={s.smallNote}>Se guardará inmediatamente al crear.</span></div>
        </form>
      </div>
    </Modal>
  );
}

export default EventModal;
