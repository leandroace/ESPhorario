import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import rrulePlugin from '@fullcalendar/rrule';
import EventModal from './EventModal';

Modal.setAppElement('#root');

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    backdropFilter: 'blur(2px)',
    zIndex: 1000
  },
  content: {
    inset: '50% auto auto 50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(680px, 96vw)',
    maxHeight: '86vh',
    padding: 0,
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
  }
};

const modalUI = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' },
  title: { fontSize: 18, fontWeight: 600, margin: 0, color: '#0f172a' },
  closeBtn: { border: '1px solid #e5e7eb', background: '#ffffff', borderRadius: 10, padding: '6px 10px', cursor: 'pointer' },
  body: { padding: 16, overflow: 'auto' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  fullRow: { gridColumn: '1 / -1' },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, color: '#475569', fontWeight: 600 },
  input: { border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none' },
  select: { border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', background: '#fff' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: 16, borderTop: '1px solid #f1f5f9', background: '#ffffff', position: 'sticky', bottom: 0 },
  leftActions: { display: 'flex', gap: 8 },
  rightActions: { display: 'flex', gap: 8 },
  btn: { border: '1px solid #d1d5db', background: '#f3f4f6', color: '#111827', borderRadius: 10, padding: '10px 14px', fontSize: 14, cursor: 'pointer' },
  btnPrimary: { border: '1px solid #111827', background: '#111827', color: '#ffffff', borderRadius: 10, padding: '10px 14px', fontSize: 14, cursor: 'pointer' },
  btnDanger: { border: '1px solid #ef4444', background: '#fff', color: '#ef4444', borderRadius: 10, padding: '10px 14px', fontSize: 14, cursor: 'pointer' },
  hint: { fontSize: 12, color: '#64748b' }
};

// =============== 👇 NUEVO: helpers de fechas/duración =====================
const normalizeDate = (v) => (v ? String(v).replace(' ', 'T') : v);

const toISOLocal = (value) => {
  const d = new Date(normalizeDate(value));
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`; // sin 'Z'
};

const toInputValue = (value) => {
  // para <input type="datetime-local">
  return toISOLocal(value).slice(0, 16); // 'YYYY-MM-DDTHH:mm'
};

const diffToISODuration = (startStr, endStr) => {
  const start = new Date(normalizeDate(startStr));
  const end = new Date(normalizeDate(endStr));
  const ms = Math.max(0, end - start);
  const totalMin = Math.max(1, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `PT${h > 0 ? `${h}H` : ''}${m > 0 ? `${m}M` : h === 0 ? '1M' : ''}`;
};
// =============== 👆 NUEVO ==================================================

function CalendarView({ salon, usuario }) {
  const [eventos, setEventos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [crearOpen, setCrearOpen] = useState(false);

  // =========== 👇 CAMBIO: mapear repetidos a rrule + duration ==============
  const cargarEventos = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/salones/${salon.id}/eventos`);

    const eventosFormateados = res.data.map((ev) => {
      const startLocal = toISOLocal(ev.fecha_inicio);
      const endLocal = toISOLocal(ev.fecha_fin);
      const duration = diffToISODuration(startLocal, endLocal);

      // guardamos baseStart/baseEnd para reflejar en el formulario
      const baseProps = {
        encargado: ev.encargado,
        repeticion: ev.repeticion,
        cupo: ev.cupo,
        id_salon: ev.id_salon ?? salon.id,
        baseStart: startLocal,
        baseEnd: endLocal
      };

      if (ev.repeticion === 'semanal') {
        return {
          id: ev.id,
          title: ev.titulo,
          rrule: {
            freq: 'weekly',
            dtstart: startLocal
            // until: '2025-12-01T23:59:00', // opcional
            // byweekday: ['th'], // opcional
          },
          duration,
          color: ev.color || '#3b82f6',
          extendedProps: baseProps
        };
      }

      if (ev.repeticion === 'cada_2_semanas') {
        return {
          id: ev.id,
          title: ev.titulo,
          rrule: {
            freq: 'weekly',
            interval: 2,       // 👈 cada 2 semanas (14 días), mismo día de la semana
            dtstart: startLocal
          },
          duration,
          color: ev.color || '#3b82f6',
          extendedProps: baseProps
        };
      }

      if (ev.repeticion === 'diaria') {
        return {
          id: ev.id,
          title: ev.titulo,
          rrule: {
            freq: 'daily',
            dtstart: startLocal
            // until: '2025-12-01T23:59:00',
          },
          duration,
          color: ev.color || '#3b82f6',
          extendedProps: baseProps
        };
      }

      // evento único
      return {
        id: ev.id,
        title: ev.titulo,
        start: startLocal,
        end: endLocal,
        color: ev.color || '#3b82f6',
        extendedProps: baseProps
      };
    });

    setEventos(eventosFormateados);
  };
  // =========== 👆 CAMBIO ====================================================

  useEffect(() => {
    if (salon?.id) cargarEventos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salon?.id]);

  const [editColor, setEditColor] = useState('#3b82f6');

  const handleEventClick = (clickInfo) => {
    const e = clickInfo.event;
    const rep = e.extendedProps.repeticion;

    // Para el formulario, preferimos las fechas base que definieron la regla
    const baseStart = e.extendedProps.baseStart || e.startStr;
    const baseEnd = e.extendedProps.baseEnd || e.endStr;

    setEditColor(e.backgroundColor || '#3b82f6');

    setEventoSeleccionado({
      id: e.id,
      titulo: e.title,
      encargado: e.extendedProps.encargado,
      fecha_inicio: toInputValue(baseStart), // 👈 se refleja correcto en <input datetime-local>
      fecha_fin: toInputValue(baseEnd),
      repeticion: rep,
      cupo: e.extendedProps.cupo,
      color: e.backgroundColor || '#3b82f6'
    });
    setModalOpen(true);
  };

  const handleEliminar = async () => {
    if (!eventoSeleccionado) return;
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/eventos/${eventoSeleccionado.id}`, {
      params: { rol: usuario.rol }
    });
    setModalOpen(false);
    cargarEventos();
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    await axios.put(`${import.meta.env.VITE_API_BASE_URL}/eventos/${eventoSeleccionado.id}`, {
      ...eventoSeleccionado,
      rol: usuario.rol,
      fecha_inicio: new Date(eventoSeleccionado.fecha_inicio).toISOString(),
      fecha_fin: new Date(eventoSeleccionado.fecha_fin).toISOString(),
    });
    setModalOpen(false);
    cargarEventos();
  };

  const handleCreateSuccess = () => {
    setCrearOpen(false);
    cargarEventos();
  };

  return (
    <>
      {/* Header del salón */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 12,
        background: '#fafafa',
        marginBottom: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <h4 style={{ margin: 0 }}>{salon?.nombre ?? 'Salón'}</h4>
          <button
            onClick={() => setCrearOpen(true)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              cursor: 'pointer'
            }}
          >
            + Crear evento
          </button>
        </div>

        <div style={{ marginTop: 8, display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div><strong>Capacidad:</strong> {salon?.capacidad ?? '—'}</div>
          <div><strong>Multimedia:</strong> {salon?.multimedia?.trim() ? salon.multimedia : '—'}</div>
          <div><strong>Novedades:</strong> {salon?.novedades?.trim() ? salon.novedades : '—'}</div>
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
        initialView="timeGridWeek"
        events={eventos}
        eventClick={handleEventClick}
        height="auto"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        scrollTime="07:00:00"
        hiddenDays={[0]}
      />

      {/* Modal de edición */}
      {modalOpen && (
        <Modal
          isOpen
          onRequestClose={() => setModalOpen(false)}
          style={modalStyles}
          shouldCloseOnEsc
          shouldCloseOnOverlayClick
        >
          {/* Header */}
          <div style={modalUI.header}>
            <h3 style={modalUI.title}>Editar evento</h3>
            <button type="button" onClick={() => setModalOpen(false)} style={modalUI.closeBtn} aria-label="Cerrar" title="Cerrar">✕</button>
          </div>

          {/* Body */}
          <div style={modalUI.body}>
            <form onSubmit={handleGuardar}>
              <div style={modalUI.formGrid}>
                <div style={{ ...modalUI.field, ...modalUI.fullRow }}>
                  <label style={modalUI.label}>Título</label>
                  <input
                    style={modalUI.input}
                    value={eventoSeleccionado.titulo}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, titulo: e.target.value })}
                    placeholder="Nombre del evento"
                  />
                </div>

                <div style={modalUI.field}>
                  <label style={modalUI.label}>Encargado</label>
                  <input
                    style={modalUI.input}
                    value={eventoSeleccionado.encargado}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, encargado: e.target.value })}
                    placeholder="Persona responsable"
                  />
                </div>

                <div style={modalUI.field}>
                  <label style={modalUI.label}>Cupo</label>
                  <input
                    type="number"
                    min={1}
                    style={modalUI.input}
                    value={eventoSeleccionado.cupo}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, cupo: e.target.value })}
                    placeholder="Cantidad de personas"
                  />
                </div>

                <div style={modalUI.field}>
                  <label style={modalUI.label}>Inicio</label>
                  <input
                    type="datetime-local"
                    style={modalUI.input}
                    value={eventoSeleccionado.fecha_inicio}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, fecha_inicio: e.target.value })}
                  />
                </div>

                <div style={modalUI.field}>
                  <label style={modalUI.label}>Fin</label>
                  <input
                    type="datetime-local"
                    style={modalUI.input}
                    value={eventoSeleccionado.fecha_fin}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, fecha_fin: e.target.value })}
                  />
                </div>

                <div style={modalUI.field}>
                  <label style={modalUI.label}>Repetición</label>
                  <select
                    style={modalUI.select}
                    value={eventoSeleccionado.repeticion}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, repeticion: e.target.value })}
                  >
                    <option value="no">No se repite</option>
                    <option value="diaria">Cada día</option>
                    <option value="semanal">Cada semana</option>
                    <option value="cada_2_semanas">Cada 2 semanas</option>
                  </select>
                  <span style={modalUI.hint}>Si el evento ya tiene ocurrencias, estás editando la regla completa.</span>
                </div>

                <div style={modalUI.field}>
                  <label style={modalUI.label}>Color</label>
                  <input
                    type="color"
                    style={{ ...modalUI.input, padding: 6, height: 42 }}
                    value={eventoSeleccionado.color || editColor}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, color: e.target.value })}
                    title="Color del evento"
                  />
                </div>
              </div>

              <div style={modalUI.footer}>
                <div style={modalUI.leftActions}>
                  <button type="button" onClick={handleEliminar} style={modalUI.btnDanger} title="Eliminar evento">Eliminar</button>
                </div>
                <div style={modalUI.rightActions}>
                  <button type="button" onClick={() => setModalOpen(false)} style={modalUI.btn}>Cancelar</button>
                  <button type="submit" style={modalUI.btnPrimary}>Guardar cambios</button>
                </div>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal de creación */}
      {crearOpen && (
        <EventModal
          closeModal={() => setCrearOpen(false)}
          salones={[salon]}
          usuario={usuario}
          onCreateSuccess={handleCreateSuccess}
        />
      )}
    </>
  );
}

export default CalendarView;
