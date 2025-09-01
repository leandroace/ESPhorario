import { useEffect, useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import CalendarView from './components/CalendarView';
import EventModal from './components/EventModal';
import DisponibilidadForm from './components/DisponibilidadForm';
import LoginForm from './components/LoginForm';
import SalonesAdmin from './components/SalonesAdmin';


import axios from 'axios';

function App() {
  const [salones, setSalones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState(0);
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem('usuario');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    axios.get('${import.meta.env.VITE_API_BASE_URL}/salones').then(res => setSalones(res.data));
  }, []);

  const logout = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  if (!usuario) return <LoginForm onLogin={setUsuario} />;

  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Gestión de Horarios</h2>
        <div>
          <strong>{usuario.nombre}</strong> ({usuario.rol}) &nbsp;
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      {usuario.rol === 'admin' && (
        <>
          
          <button style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }} onClick={() => setModalOpen(true)}>Crear Evento</button>
          
          <SalonesAdmin
            usuario={usuario}
            salones={salones}
            setSalones={setSalones}
          />
        </>
      )}

      <DisponibilidadForm />

      <Tabs selectedIndex={selectedSalon} onSelect={setSelectedSalon}>
        <TabList>
          {salones.map(salon => <Tab key={salon.id}>{salon.nombre}</Tab>)}
        </TabList>

        {salones.map(salon => (
          <TabPanel key={salon.id}>
            <CalendarView salon={salon} usuario={usuario} />
          </TabPanel>
        ))}
      </Tabs>

      {modalOpen && (
        <EventModal
          closeModal={() => setModalOpen(false)}
          salones={salones}
          usuario={usuario}
          onCreateSuccess={() => {
            // Opcional: puedes usar un useRef o estado global para forzar actualización
            window.location.reload(); // Recarga toda la app (alternativa simple)
          }}
        />
      )}
    </div>
  );
}

export default App;
