export const generarPDFMuestra = (muestra: any) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            background-color: white;
            padding: 20px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #333;
            padding: 30px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 28px;
            color: #1e40af;
            margin-bottom: 5px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            border-left: 4px solid #2563eb;
            padding-left: 10px;
            margin-bottom: 12px;
            text-transform: uppercase;
          }
          .field-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
          }
          .field-group.full {
            grid-template-columns: 1fr;
          }
          .field {
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 4px;
            background-color: #f9fafb;
          }
          .field-label {
            font-weight: bold;
            color: #2563eb;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .field-value {
            font-size: 16px;
            color: #000;
            font-weight: 500;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
          }
          .status-pendiente {
            background-color: #fef3c7;
            color: #92400e;
          }
          .status-procesando {
            background-color: #dbeafe;
            color: #1e40af;
          }
          .status-completado {
            background-color: #d1fae5;
            color: #065f46;
          }
          .footer {
            border-top: 2px solid #ddd;
            margin-top: 30px;
            padding-top: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .signature-area {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 40px;
            padding-top: 5px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LABORATORIO CLÍNICO</h1>
            <p>Registro de Muestra Clínica</p>
          </div>

          <div class="section">
            <div class="section-title">Información de la Muestra</div>
            <div class="field-group">
              <div class="field">
                <div class="field-label">ID de Muestra</div>
                <div class="field-value">#${muestra?.id?.toString().padStart(6, '0')}</div>
              </div>
              <div class="field">
                <div class="field-label">Fecha de Registro</div>
                <div class="field-value">${new Date(muestra?.fecha_toma).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
              </div>
            </div>
            <div class="field-group">
              <div class="field">
                <div class="field-label">Tipo de Examen</div>
                <div class="field-value">${muestra?.tipo_examen?.charAt(0).toUpperCase() + muestra?.tipo_examen?.slice(1)}</div>
              </div>
              <div class="field">
                <div class="field-label">Estado</div>
                <div class="field-value">
                  <span class="status-badge status-${muestra?.estado}">
                    ${muestra?.estado}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Información del Paciente</div>
            <div class="field-group">
              <div class="field">
                <div class="field-label">Nombre Completo</div>
                <div class="field-value">${muestra?.paciente_nombre}</div>
              </div>
            </div>
          </div>

          ${muestra?.resultado ? `
            <div class="section">
              <div class="section-title">Resultado</div>
              <div class="field-group full">
                <div class="field">
                  <div class="field-value">${muestra?.resultado}</div>
                </div>
              </div>
            </div>
          ` : ''}

          ${muestra?.observaciones ? `
            <div class="section">
              <div class="section-title">Observaciones</div>
              <div class="field-group full">
                <div class="field">
                  <div class="field-value">${muestra?.observaciones}</div>
                </div>
              </div>
            </div>
          ` : ''}

          <div class="signature-area">
            <div class="signature">
              <div class="signature-line">Responsable del Laboratorio</div>
            </div>
            <div class="signature">
              <div class="signature-line">Firma del Paciente</div>
            </div>
          </div>

          <div class="footer">
            <p>Documento generado automáticamente</p>
            <p>Laboratorio Clínico San Rafael © 2024</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Crear blob y descargar
  const element = document.createElement('div');
  element.innerHTML = html;
  
  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Esperar a que cargue y luego mostrar diálogo de descarga
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};