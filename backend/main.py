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

# Configuración de la API (Metadatos para la documentación)
app = FastAPI(
    title="SST SENATI API",
    description="API REST para la gestión de inspecciones de seguridad y salud en el trabajo",
    version="1.0.0",
    docs_url="/api/v1/d ocs",
    openapi_url="/api/v1/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
def login(user: Login):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nombre, cargo, firma_url FROM usuarios WHERE correo_insti = %s", (user.correo,))
    usuario = cursor.fetchone()
    conn.close()
    if usuario: return api_response(data=usuario)
    raise HTTPException(status_code=401, detail="Credenciales incorrectas")

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
    # Aquí iría la lógica de recuperación de datos y PDF que ya tenemos
    # Se retorna FileResponse
    return api_response(message="Generando PDF...")

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