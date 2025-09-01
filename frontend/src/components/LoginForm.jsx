import { useState } from 'react';
import axios from 'axios';

function LoginForm({ onLogin }) {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('${import.meta.env.VITE_API_BASE_URL}/login', { correo, contraseña });
      const usuario = res.data.usuario;
      localStorage.setItem('usuario', JSON.stringify(usuario));
      onLogin(usuario);
    } catch (err) {
      setError('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  // === STYLES (inline) ===
  const colors = {
    red: '#ef4444',
    redDark: '#dc2626',
    gray100: '#f5f5f5',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray500: '#6b7280',
    gray700: '#374151',
    white: '#ffffff',
  };

  const page = {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: `linear-gradient(135deg, ${colors.gray100}, ${colors.gray200})`,
    padding: '24px',
  };

  const card = {
    width: '100%',
    maxWidth: 420,
    background: colors.white,
    borderRadius: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    border: `1px solid ${colors.gray200}`,
    padding: 28,
  };

  const header = {
    marginBottom: 18,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };

  const badge = {
    width: 10,
    height: 10,
    borderRadius: '999px',
    background: colors.red,
    boxShadow: '0 0 0 4px rgba(239,68,68,0.15)',
  };

  const title = {
    margin: 0,
    fontSize: 22,
    color: colors.gray700,
    fontWeight: 700,
    letterSpacing: '.2px',
  };

  const subtitle = {
    marginTop: 4,
    fontSize: 13,
    color: colors.gray500,
  };

  const field = { display: 'flex', flexDirection: 'column', gap: 6 };

  const label = {
    fontSize: 13,
    color: colors.gray700,
    fontWeight: 600,
  };

  const inputWrap = (hasIconRight = false) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${colors.gray300}`,
    borderRadius: 12,
    background: colors.white,
    transition: 'box-shadow .15s, border-color .15s',
    padding: hasIconRight ? '10px 44px 10px 12px' : '10px 12px',
  });

  const input = {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: 14,
    color: colors.gray700,
    background: 'transparent',
  };

  const eyeBtn = {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: colors.gray100,
    color: colors.gray700,
    fontSize: 12,
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
  };

  const errorBox = {
    background: '#fee2e2',
    color: colors.redDark,
    border: `1px solid ${colors.red}`,
    borderRadius: 12,
    padding: '10px 12px',
    fontSize: 13,
    marginBottom: 10,
  };

  const btn = (disabled) => ({
    width: '100%',
    border: 'none',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '.2px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? '#fca5a5' : colors.red,
    color: colors.white,
    boxShadow: disabled ? 'none' : '0 6px 16px rgba(239,68,68,.25)',
    transform: 'translateY(0)',
    transition: 'transform .1s ease, filter .1s ease',
  });

  const hintRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  };

  const linkBtn = {
    border: 'none',
    background: 'transparent',
    color: colors.red,
    fontSize: 12,
    cursor: 'pointer',
    padding: 0,
  };

  const divider = {
    height: 1,
    background: colors.gray200,
    margin: '16px 0',
  };

  return (
    <div style={page}>
      <form onSubmit={handleLogin} style={card}>
        <div style={header}>
          <span style={badge} />
          <div>
            <h3 style={title}>Iniciar sesión</h3>
            <p style={subtitle}>Accede con tu correo institucional</p>
          </div>
        </div>

        {error ? <div style={errorBox}>{error}</div> : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={field}>
            <label style={label} htmlFor="correo">Correo</label>
            <div
              style={inputWrap(false)}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 4px rgba(239,68,68,.10)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.gray500)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.gray300)}
            >
              <input
                id="correo"
                type="email"
                placeholder="tu@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                autoComplete="email"
                style={input}
              />
            </div>
          </div>

          <div style={field}>
            <label style={label} htmlFor="password">Contraseña</label>
            <div
              style={inputWrap(true)}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 4px rgba(239,68,68,.10)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.gray500)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.gray300)}
            >
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
                autoComplete="current-password"
                style={input}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                style={eyeBtn}
              >
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <div style={hintRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input id="remember" type="checkbox" style={{ accentColor: colors.red }} />
              <label htmlFor="remember" style={{ fontSize: 12, color: colors.gray700 }}>
                Recordarme
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={btn(loading)}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.filter = 'brightness(0.98)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>

          <div style={divider} />

          <p style={{ fontSize: 12, color: colors.gray500, textAlign: 'center', margin: 0 }}>
            Acceso restringido. Si no tienes cuenta, contacta al administrador.
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
