import { useState } from 'react';
import axios from 'axios';

function SalonForm({ onSalonCreado }) {
  const [form, setForm] = useState({
    nombre: '',
    capacidad: '',
    multimedia: '',
    novedades: ''
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('http://localhost:3001/api/salones', form)
      .then(() => {
        alert('Salón añadido');
        setForm({ nombre: '', capacidad: '', multimedia: '', novedades: '' });
        if (onSalonCreado) onSalonCreado();
      });
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h4>Añadir nuevo salón</h4>
      <form onSubmit={handleSubmit}>
        <label>Nombre: <input name="nombre" value={form.nombre} onChange={handleChange} /></label><br />
        <label>Capacidad: <input type="number" name="capacidad" value={form.capacidad} onChange={handleChange} /></label><br />
        <label>Multimedia: <input name="multimedia" value={form.multimedia} onChange={handleChange} /></label><br />
        <label>Novedades: <input name="novedades" value={form.novedades} onChange={handleChange} /></label><br />
        <button type="submit">Agregar salón</button>
      </form>
    </div>
  );
}

export default SalonForm;
