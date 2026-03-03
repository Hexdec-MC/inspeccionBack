from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import datetime
import mysql.connector

# Importaciones locales
from database import get_connection
from models import InspeccionCreate, Login
from excel_service import procesar_excel_anexo
from pdf_service import generar_reporte_completo
from fastapi.staticfiles import StaticFiles

# Configuración de la API (Metadatos para la documentación)
app = FastAPI(
    title="SST SENATI API",
    description="API REST para la gestión de inspecciones de seguridad y salud en el trabajo",
    version="1.0.0",
    docs_url="/api/v1/docs",
    openapi_url="/api/v1/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Puerto por defecto de Vite/React Router v7
        "http://127.0.0.1:5173",
        "http://localhost:3000",  # Mantener el 3000 por si acaso
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# --- RESPUESTAS ESTÁNDAR ---
def api_response(status="success", data=None, message=""):
    return {"status": status, "data": data, "message": message}

# --- LÓGICA DE NEGOCIO (Helpers internos) ---
def notify_inspectors(cursor, uuid, ambiente_id):
    cursor.execute("SELECT nombre_ambiente FROM ambientes WHERE id = %s", (ambiente_id,))
    nombre_amb = cursor.fetchone()[0]
    cursor.execute("SELECT id FROM usuarios WHERE cargo = 'Inspector'")
    for (insp_id,) in cursor.fetchall():
        query = "INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES (%s, %s, %s, 'Firma_Pendiente')"
        cursor.execute(query, (insp_id, "Nueva Inspección", f"Ambiente: {nombre_amb}. Pendiente de firma.", "Firma_Pendiente"))

# --- ENDPOINTS VERSIONADOS (V1) ---

# [Auth]
@app.post("/api/v1/auth/login", tags=["Autenticación"])
def login(user: Login): # Usa el nombre de clase correcto
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Buscamos el usuario
    query = "SELECT id, nombre, cargo, firma_url FROM usuarios WHERE correo_insti = %s"
    cursor.execute(query, (user.correo,))
    usuario = cursor.fetchone()
    conn.close()
    
    if usuario:
        # Retornamos la respuesta estándar que definiste en el main
        return api_response(data=usuario)
        
    raise HTTPException(status_code=401, detail="Usuario no encontrado")

# [Inspecciones]
@app.post("/api/v1/inspecciones", status_code=201, tags=["Inspecciones"])
def create_inspeccion(data: InspeccionCreate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Cabecera
        cursor.execute("INSERT INTO inspecciones (uuid, ambiente_id, instructor_id, fecha_creacion, estado) VALUES (%s, %s, %s, %s, 'Enviado')",
                       (data.uuid, data.ambiente_id, data.instructor_id, datetime.date.today()))
        ins_id = cursor.lastrowid
        
        # Detalles y Acciones Correctivas
        for d in data.detalles:
            cursor.execute("INSERT INTO inspeccion_detalles (inspeccion_id, item_id, resultado, observacion) VALUES (%s, %s, %s, %s)",
                           (ins_id, d.item_id, d.resultado, d.observacion))
            if d.resultado == 'No Conforme':
                plazo = datetime.date.today() + datetime.timedelta(days=7)
                cursor.execute("INSERT INTO acciones_correctivas (inspeccion_id, item_id, accion_tomar, plazo) VALUES (%s, %s, %s, %s)",
                               (ins_id, d.item_id, d.observacion or "Revisión técnica", plazo))
        
        notify_inspectors(cursor, data.uuid, data.ambiente_id)
        conn.commit()
        return api_response(data={"uuid": data.uuid}, message="Inspección creada")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally: conn.close()

@app.get("/api/v1/inspecciones/{uuid}/reporte", tags=["Inspecciones"])
def get_reporte_pdf(uuid: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Obtener cabecera de la inspección
        query_ins = """
            SELECT i.*, a.nombre_ambiente as ambiente, s.nombre_sede as area 
            FROM inspecciones i
            JOIN ambientes a ON i.ambiente_id = a.id
            JOIN sedes_areas s ON a.area_id = s.id
            WHERE i.uuid = %s
        """
        cursor.execute(query_ins, (uuid,))
        datos = cursor.fetchone()
        
        if not datos:
            raise HTTPException(status_code=404, detail="Inspección no encontrada")

        # 2. Obtener detalles con sus códigos de ítem
        query_det = """
            SELECT iv.codigo, iv.descripcion, id.resultado, id.observacion 
            FROM inspeccion_detalles id
            JOIN items_verificacion iv ON id.item_id = iv.id
            WHERE id.inspeccion_id = %s
        """
        cursor.execute(query_det, (datos['id'],))
        detalles = cursor.fetchall()

        # 3. Obtener datos del instructor para la firma
        cursor.execute("SELECT nombre, firma_url as firma_path FROM usuarios WHERE id = %s", (datos['instructor_id'],))
        instructor = cursor.fetchone()

        # 4. Llamar al servicio que creaste
        ruta_pdf = generar_reporte_completo(datos, detalles, instructor)

        return FileResponse(
            path=ruta_pdf, 
            filename=f"Reporte_SST_{uuid}.pdf", 
            media_type='application/pdf'
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# [Recursos/Maestros]
@app.get("/api/v1/sedes", tags=["Recursos"])
def list_sedes():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM sedes_areas")
    res = cursor.fetchall()
    conn.close()
    return api_response(data=res)

@app.get("/api/v1/ambientes", tags=["Recursos"])
def list_ambientes(sede_id: int = Query(...)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nombre_ambiente FROM ambientes WHERE area_id = %s", (sede_id,))
    res = cursor.fetchall()
    conn.close()
    return api_response(data=res)

@app.get("/api/v1/usuarios/{id_usuario}/programa", tags=["Programación"])
def obtener_programa_usuario(id_usuario: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Usamos los nombres de columnas que vemos en tu captura de phpMyAdmin
    query = """
        SELECT 
            p.id, 
            p.tipo_inspeccion, 
            p.fecha_programada,
            p.estado,
            a.nombre_ambiente,
            s.nombre_sede
        FROM programa p
        JOIN ambientes a ON p.ambiente_id = a.id
        JOIN sedes_areas s ON a.area_id = s.id
        WHERE p.instructor_id = %s
    """
    
    try:
        cursor.execute(query, (id_usuario,))
        programa = cursor.fetchall()
        return api_response(data=programa)
    except Exception as e:
        print(f"Error SQL: {e}")
        raise HTTPException(status_code=500, detail="Error al consultar el programa")
    finally:
        conn.close()

@app.post("/api/v1/admin/upload-items", tags=["Administración"])
async def upload_excel(file: UploadFile = File(...)):
    conn = get_connection()
    try:
        total = procesar_excel_anexo(file, conn)
        return api_response(message=f"Se procesaron {total} ítems correctamente")
    finally:
        conn.close()

@app.get("/api/v1/usuarios/{id_usuario}/stats-instructor", tags=["Dashboard"])
def get_stats_instructor(id_usuario: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Total de inspecciones realizadas por el instructor
        cursor.execute("SELECT COUNT(*) as total FROM inspecciones WHERE instructor_id = %s", (id_usuario,))
        total = cursor.fetchone()['total']

        # 2. Inspecciones que aún no tienen firma del inspector (estado 'Enviado')
        cursor.execute("SELECT COUNT(*) as pendientes FROM inspecciones WHERE instructor_id = %s AND estado = 'Enviado'", (id_usuario,))
        pendientes = cursor.fetchone()['pendientes']

        # 3. Próxima inspección programada
        cursor.execute("SELECT fecha_programada FROM programa WHERE instructor_id = %s AND vigencia = 1 AND fecha_programada >= CURDATE() ORDER BY fecha_programada ASC LIMIT 1", (id_usuario,))
        proxima = cursor.fetchone()
        fecha_prox = proxima['fecha_programada'].strftime('%d/%m/%Y') if proxima else "Sin programar"

        return api_response(data={
            "total_enviados": total,
            "falta_firma": pendientes,
            "proxima_fecha": fecha_prox
        })
    finally:
        conn.close()
        
@app.get("/api/v1/usuarios/{id_usuario}/actividad-reciente", tags=["Dashboard"])
def get_actividad_instructor(id_usuario: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT i.uuid, i.fecha_creacion, i.estado, a.nombre_ambiente
            FROM inspecciones i
            JOIN ambientes a ON i.ambiente_id = a.id
            WHERE i.instructor_id = %s
            ORDER BY i.fecha_creacion DESC
            LIMIT 5
        """
        cursor.execute(query, (id_usuario,))
        actividad = cursor.fetchall()
        return api_response(data=actividad)
    finally:
        conn.close()

from storage_service import router as storage_router
app.include_router(storage_router)