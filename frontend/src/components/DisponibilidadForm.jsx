import { useState } from 'react';
import axios from 'axios';

const s = {
  wrap: { marginTop: 16, marginBottom: 16 },
  title: { margin: 0, marginBottom: 12, fontSize: 18, fontWeight: 600, color: '#1e293b' },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 12,
  },
  label: { fontSize: 13, color: '#475569', fontWeight: 600 },
  // El label agrupa la etiqueta y el input para mantenerlo horizontal
  field: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
  },
  input: {
    height: 34,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: '0 10px',
    background: '#ffffff',
    color: '#111827',
    outline: 'none',
  },
  number: {
    height: 34,
    width: 90,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: '0 10px',
    background: '#ffffff',
    color: '#111827',
    outline: 'none',
  },
  button: {
    height: 36,
    padding: '0 14px',
    borderRadius: 8,
    border: '1px solid #2563eb',
    background: '#3b82f6',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  msg: { marginTop: 10, marginBottom: 6, fontSize: 14, color: '#0f172a' },
  msgOk: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: 8,
    background: '#dcfce7',
    border: '1px solid #22c55e',
    color: '#166534',
    fontWeight: 600,
  },
  msgErr: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: 8,
    background: '#fee2e2',
    border: '1px solid #ef4444',
    color: '#991b1b',
    fontWeight: 600,
  },
  list: { listStyle: 'none', padding: 0, marginTop: 10, display: 'grid', gap: 10 },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 12,
    background: '#ffffff',
  },
  cardTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' },
  cardRow: { margin: '2px 0', fontSize: 14, color: '#334155' },
};

function DisponibilidadForm() {
  const [form, setForm] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    cupo: '',
  });
  const [resultado, setResultado] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [ok, setOk] = useState(null); // null | true | false
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fecha_inicio || !form.fecha_fin || !form.cupo) {
      setOk(false);
      setMensaje('Por favor llena todos los campos');
      setResultado([]);
      return;
    }

    if (new Date(form.fecha_fin) <= new Date(form.fecha_inicio)) {
      setOk(false);
      setMensaje('La fecha/hora de fin debe ser posterior al inicio');
      setResultado([]);
      return;
    }

    setLoading(true);
    try {
      const iniISO = new Date(form.fecha_inicio).toISOString();
      const finISO = new Date(form.fecha_fin).toISOString();

      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/disponibilidad`, 
        {...form, cupo: Number(form.cupo),
      }
    `${import.meta.env.VITE_API_BASE_URL}/disponibilidad`,
    { fecha_inicio: iniISO, fecha_fin: finISO, cupo: Number(form.cupo) }
    );

      if (Array.isArray(res.data) && res.data.length > 0) {
        setResultado(res.data);
        setOk(true);
        setMensaje(`Salones disponibles: ${res.data.length}`);
      } else {
        setResultado([]);
        setOk(false);
        setMensaje('No hay salones disponibles para los criterios indicados.');
      }
    } catch (err) {
      setOk(false);
      setMensaje('Error al consultar disponibilidad');
      setResultado([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.wrap}>
      <h4 style={s.title}>Consultar disponibilidad de salones</h4>

      {/* Formulario horizontal */}
      <form onSubmit={handleSubmit} style={s.formRow}>
        <label style={s.field}>
          <span style={s.label}>Inicio</span>
          <input
            type="datetime-local"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleChange}
            style={s.input}
          />
        </label>

        <label style={s.field}>
          <span style={s.label}>Fin</span>
          <input
            type="datetime-local"
            name="fecha_fin"
            value={form.fecha_fin}
            onChange={handleChange}
            style={s.input}
          />
        </label>

        <label style={s.field}>
          <span style={s.label}>Cupo</span>
          <input
            type="number"
            name="cupo"
            min="1"
            value={form.cupo}
            onChange={handleChange}
            style={s.number}
          />
        </label>

        <button
          type="submit"
          style={{ ...s.button, ...(loading ? s.buttonDisabled : null) }}
          disabled={loading}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#535a6bff')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#535a6bff')}
        >
          {loading ? 'Consultando…' : 'Consultar'}
        </button>
      </form>

      {/* Mensaje */}
      {mensaje && (
        <p style={s.msg}>
          <span style={ok ? s.msgOk : s.msgErr}>{mensaje}</span>
        </p>
      )}

      {/* Resultados */}
      <ul style={s.list}>
        {resultado.map((sln) => (
          <li key={sln.id} style={s.card}>
            <h5 style={s.cardTitle}>{sln.nombre}</h5>
            <div style={s.cardRow}>Capacidad: <strong>{sln.capacidad}</strong></div>
            <div style={s.cardRow}>
              Multimedia: <strong>{sln.multimedia || 'No especificado'}</strong>
            </div>
            <div style={s.cardRow}>
              Novedades: <strong>{sln.novedades || 'Ninguna'}</strong>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DisponibilidadForm;
