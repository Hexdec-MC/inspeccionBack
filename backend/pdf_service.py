from fpdf import FPDF
import os

class SST_PDF(FPDF):
    def add_background(self, image_path):
        # Coloca la imagen del Anexo 03 como fondo para mantener el formato exacto
        if os.path.exists(image_path):
            self.image(image_path, x=0, y=0, w=210, h=297)

def obtener_coordenada_y(codigo):
    # Mapeo de coordenadas Y (en mm) para los ítems del formulario [cite: 12-181, 198-219]
    mapeo = {
        "1.1": 92, "12": 100, "13": 105, "14": 110,    # Protección contra incendios
        "10.1": 115, "10.2": 120, "10.3": 125,          # Primeros Auxilios
        "2.1": 135, "2.2": 140, "2.3": 145, "2.4": 150,  # Ambientes de Trabajo
        "4.1": 185, "4.2": 190, "4.3": 195               # Instalaciones Eléctricas
    }
    return mapeo.get(str(codigo), 0)

def generar_reporte_completo(datos_inspeccion, detalles, instructor, inspector=None):
    pdf = SST_PDF()
    pdf.set_auto_page_break(auto=False)
    
    # --- PÁGINA 1: ANVERSO ---
    pdf.add_page()
    # Asegúrate de tener esta imagen en tu carpeta 'assets'
    pdf.add_background('assets/plantilla_anverso.png') 
    pdf.set_font("Arial", "B", 10)

    # Llenado de cabecera [cite: 4, 5, 6]
    pdf.text(x=45, y=47, txt=datos_inspeccion.get('area', ''))
    pdf.text(x=45, y=53, txt=datos_inspeccion.get('ambiente', ''))
    pdf.text(x=160, y=53, txt=str(datos_inspeccion.get('fecha', '')))

    # Dibujar las "X" de inspección [cite: 17, 20, 24]
    pdf.set_font("Arial", "B", 12)
    detalles_fallidos = []

    for d in detalles:
        y_pos = obtener_coordenada_y(d['codigo'])
        if y_pos > 0:
            # Coordenadas X para Conforme (174), No Conforme (184), No Aplica (194)
            if d['resultado'] == 'Conforme':
                pdf.text(x=174, y=y_pos, txt="X")
            elif d['resultado'] == 'No Conforme':
                pdf.text(x=184, y=y_pos, txt="X")
                detalles_fallidos.append(d)
            elif d['resultado'] == 'No Aplica':
                pdf.text(x=194, y=y_pos, txt="X")

    # Firma del Instructor (Elaborado por) [cite: 182]
    if instructor.get('firma_path') and os.path.exists(instructor['firma_path']):
        pdf.image(instructor['firma_path'], x=35, y=255, w=45, h=18)

    # --- PÁGINA 2: REVERSO (Solo si hay 'No Conformes') ---
    if detalles_fallidos:
        pdf.add_page()
        pdf.add_background('assets/plantilla_reverso.png')
        
        y_table = 65
        pdf.set_font("Arial", size=8)
        
        for fallido in detalles_fallidos:
            # Columna: Condición Peligrosa Encontrada [cite: 223, 224]
            pdf.set_xy(12, y_table)
            pdf.multi_cell(65, 5, txt=f"{fallido['codigo']}: {fallido['descripcion']}")
            
            # Columna: Acción a Tomar (Observación inicial del Instructor) [cite: 224, 228]
            pdf.set_xy(82, y_table)
            pdf.multi_cell(65, 5, txt=fallido.get('observacion', 'Revisar equipo'))
            
            y_table += 15 # Salto a la siguiente fila de la tabla

        # Firma del Inspector (Prevencionista/Brigadista) [cite: 227]
        if inspector and inspector.get('firma_path') and os.path.exists(inspector['firma_path']):
            pdf.image(inspector['firma_path'], x=130, y=255, w=45, h=18)

    # Crear carpeta de reportes si no existe
    if not os.path.exists('reportes'):
        os.makedirs('reportes')

    nombre_archivo = f"reportes/Inspeccion_{datos_inspeccion['uuid']}.pdf"
    pdf.output(nombre_archivo)
    return nombre_archivo

def insertar_firma_segura(pdf, path, x, y):
    if path and os.path.exists(path):
        pdf.image(path, x=x, y=y, w=45, h=18)
    else:
        pdf.set_xy(x, y)
        pdf.set_font("Arial", "I", 8)
        pdf.cell(45, 10, "Firma no disponible", border=1)