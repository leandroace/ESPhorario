import { useEffect, useState } from 'react';
import axios from 'axios';

function SalonesAdmin({ usuario }) {
    const [salones, setSalones] = useState([]);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    // Toggles de secciones
    const [mostrarGestion, setMostrarGestion] = useState(false);
    const [mostrarCrear, setMostrarCrear] = useState(false);

    const [nuevoSalon, setNuevoSalon] = useState({
        nombre: '',
        capacidad: '',
        multimedia: '',
        novedades: ''
    });

    const cargarSalones = async () => {
        setCargando(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/salones`);
            setSalones(res.data);
        } catch (e) {
            setMensaje('No se pudieron cargar los salones');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarSalones();
    }, []);

    const handleInputChange = (id, field, value) => {
        setSalones(prev =>
            prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
        );
    };

    const guardarCambios = async (salon) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/salones/${salon.id}`, {
                id: salon.id,
                nombre: salon.nombre,
                capacidad: Number(salon.capacidad),
                multimedia: salon.multimedia ?? '',
                novedades: salon.novedades ?? '',
                rol: usuario?.rol
            });
            setMensaje('Cambios guardados');
            cargarSalones();
        } catch (err) {
            setMensaje('Error al guardar');
        }
    };

    const eliminarSalon = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este salón?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/salones/${id}?rol=${usuario?.rol}`);
            setMensaje('Salón eliminado');
            cargarSalones();
        } catch (err) {
            setMensaje('Error al eliminar');
        }
    };

    const crearSalon = async () => {
        if (!nuevoSalon.nombre || !nuevoSalon.capacidad) {
            setMensaje('Completa nombre y capacidad');
            return;
        }
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/salones`, {
                ...nuevoSalon,
                capacidad: Number(nuevoSalon.capacidad),
                rol: usuario?.rol
            });
            setMensaje('Salón creado exitosamente');
            setNuevoSalon({ nombre: '', capacidad: '', multimedia: '', novedades: '' });
            cargarSalones();
        } catch (err) {
            setMensaje('Error al crear salón');
        }
    };

    return (
        <div style={{ maxWidth: 920}}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <button
                    onClick={() => setMostrarGestion(v => !v)}
                    aria-expanded={mostrarGestion}
                    style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
                >
                    {mostrarGestion ? 'Ocultar gestión de salones' : 'Gestión de salones'}
                </button>

                <button
                    onClick={() => setMostrarCrear(v => !v)}
                    aria-expanded={mostrarCrear}
                    style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
                >
                    {mostrarCrear ? 'Ocultar crear salón' : 'Crear salón'}
                </button>
            </div>

            {mensaje && (
                <p><strong>{mensaje}</strong></p>
            )}

            {mostrarGestion && (
                <section
                    aria-label="Gestión de Salones"
                    style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16, marginBottom: 16 }}
                >
                    <h3 style={{ marginTop: 0 }}>Gestión de Salones</h3>

                    {cargando ? (
                        <p>Cargando…</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Nombre</th>
                                        <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Capacidad</th>
                                        <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Multimedia</th>
                                        <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Novedades</th>
                                        <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salones.map(salon => (
                                        <tr key={salon.id}>
                                            <td style={{ padding: 8 }}>
                                                <input
                                                    value={salon.nombre ?? ''}
                                                    onChange={(e) => handleInputChange(salon.id, 'nombre', e.target.value)}
                                                />
                                            </td>
                                            <td style={{ padding: 8 }}>
                                                <input
                                                    type="number"
                                                    value={salon.capacidad ?? ''}
                                                    onChange={(e) => handleInputChange(salon.id, 'capacidad', e.target.value)}
                                                />
                                            </td>
                                            <td style={{ padding: 8 }}>
                                                <input
                                                    value={salon.multimedia ?? ''}
                                                    onChange={(e) => handleInputChange(salon.id, 'multimedia', e.target.value)}
                                                    placeholder="Proyector, sonido, TV…"
                                                />
                                            </td>
                                            <td style={{ padding: 8 }}>
                                                <input
                                                    value={salon.novedades ?? ''}
                                                    onChange={(e) => handleInputChange(salon.id, 'novedades', e.target.value)}
                                                    placeholder="Observaciones/estado"
                                                />
                                            </td>
                                            <td style={{ padding: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                <button style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }} onClick={() => guardarCambios(salon)}>Guardar</button>
                                                <button
                                                    onClick={() => eliminarSalon(salon.id)}
                                                    style={{ color: 'white', background: '#d11', borderRadius: 6 }}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {salones.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ padding: 8 }}>No hay salones registrados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {mostrarCrear && (
                <section
                    aria-label="Crear nuevo salón"
                    style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}
                >
                    <h4 style={{ marginTop: 0 }}>Crear nuevo salón</h4>
                    <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 12 }}>
                        <input
                            placeholder="Nombre"
                            value={nuevoSalon.nombre}
                            onChange={(e) => setNuevoSalon({ ...nuevoSalon, nombre: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Capacidad"
                            value={nuevoSalon.capacidad}
                            onChange={(e) => setNuevoSalon({ ...nuevoSalon, capacidad: e.target.value })}
                        />
                        <input
                            placeholder="Multimedia"
                            value={nuevoSalon.multimedia}
                            onChange={(e) => setNuevoSalon({ ...nuevoSalon, multimedia: e.target.value })}
                        />
                        <input
                            placeholder="Novedades"
                            value={nuevoSalon.novedades}
                            onChange={(e) => setNuevoSalon({ ...nuevoSalon, novedades: e.target.value })}
                        />
                    </div>
                    <button style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }} onClick={crearSalon}>Crear salón</button>
                    
                </section>
            )}
        </div>
    );
}

export default SalonesAdmin;
