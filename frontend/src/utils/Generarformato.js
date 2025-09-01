import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const pad2 = (n) => String(n).padStart(2, '0');
const plantillaURL = new URL('formats/aula.pdf', import.meta.env.BASE_URL).href;

export async function generarFormatoSolicitud(
  evento,
  
) {
  const bytes = await fetch(plantillaURL).then(r => r.arrayBuffer());
  const pdf = await PDFDocument.load(bytes);
  const page = pdf.getPages()[0];
  const { width, height } = page.getSize();

  const font  = await pdf.embedFont(StandardFonts.Helvetica);
  const fontB = await pdf.embedFont(StandardFonts.HelveticaBold);
  const yTop  = y => height - y; // convertir “desde arriba”

  // -------- Coordenadas (mitad izquierda) --------
  const xBase = 44;
  const Y = {
    // ↑ números más pequeños = más arriba en la hoja (porque usamos yTop)
    fechaActual:       160,   // ⬅️ NUEVO: "Fecha" de la solicitud (ajústalo según tu PDF)
    nombreSolicitante: 208,
    facultad:          208,
    area:              208,
    actividades:       236,
    filaDatos:         282,   // misma fila: Fecha / Hora ini / Hora fin / Cupo / Aula
    observ:            330
  };
  const X = {
    // columna de la fila de datos
    fecha:      xBase + 32,
    horaInicio: xBase + 115,
    horaFin:    xBase + 200,
    cupo:       xBase + 260,
    aula:       xBase + 292
  };

  // Fechas de inicio/fin (las del evento)
  const ini = new Date(evento.fechaInicio);
  const fin = new Date(evento.fechaFin);
  const fechaStr = `${pad2(ini.getDate())}/${pad2(ini.getMonth()+1)}/${ini.getFullYear()}`;
  const horaIni  = `${pad2(ini.getHours())}:${pad2(ini.getMinutes())}`;
  const horaFin  = `${pad2(fin.getHours())}:${pad2(fin.getMinutes())}`;

  // ⬇️ Fecha ACTUAL de emisión del formato (automática)
  const hoy = new Date();
  const fechaActualStr = `${pad2(hoy.getDate())}       ${pad2(hoy.getMonth()+1)}      ${hoy.getFullYear()}`;

  const draw = (text, x, y, { bold=false, size=10 } = {}) => {
    page.drawText(String(text ?? ''), {
      x, y: yTop(y), size,
      font: bold ? fontB : font,
      color: rgb(0, 0, 0)
    });
  };

  // ------- Campos -------
  // Fecha actual (colócala donde corresponde en tu planilla)
  // Si tu campo "Fecha" está más a la derecha, sube x (ej. xBase + 420).
  draw(fechaActualStr, xBase + 253, Y.fechaActual, { bold: true }); // AJUSTA x/y a tu PDF

  // Nombre del solicitante
  draw(evento.encargado, xBase + 16, Y.nombreSolicitante, { bold: true });

  // Siempre "SALUD" para Facultad y Área
  draw('SALUD', xBase + 150, Y.facultad, { bold: true });
  draw('SALUD', xBase +  250, Y.area,     { bold: true });

  // Actividades / descripción (usa el título)
  draw(evento.titulo || '', xBase + 16, Y.actividades, { bold: true });

  // Fila: fecha de uso, hora ini/fin, cupo, aula
  draw(fechaStr,                X.fecha,      Y.filaDatos);
  draw(horaIni,                 X.horaInicio, Y.filaDatos);
  draw(horaFin,                 X.horaFin,    Y.filaDatos);
  draw(String(evento.cupo || ''), X.cupo,     Y.filaDatos);
  draw(evento.salonNombre || '',  X.aula,     Y.filaDatos, { bold: true });

  if (evento.observaciones) {
    draw(evento.observaciones, xBase + 100, Y.observ);
  }

  const out = await pdf.save();
  const blob = new Blob([out], { type: 'application/pdf' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Solicitud_${(evento.titulo || 'evento').replace(/\s+/g, '_')}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
