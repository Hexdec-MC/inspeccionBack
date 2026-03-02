import os
import shutil
from app_config import UploadFile, File

# Directorios para guardar archivos
UPLOAD_DIR = "uploads"
FIRMAS_DIR = os.path.join(UPLOAD_DIR, "firmas")
EVIDENCIAS_DIR = os.path.join(UPLOAD_DIR, "evidencias")

# Crear carpetas si no existen
os.makedirs(FIRMAS_DIR, exist_ok=True)
os.makedirs(EVIDENCIAS_DIR, exist_ok=True)

# Endpoint para que el Admin suba la firma del Instructor
@app.post("/admin/upload-firma/{usuario_id}")
async def upload_firma(usuario_id: int, file: UploadFile = File(...)):
    # Validar que sea PNG
    if not file.filename.endswith(".png"):
        return {"error": "La firma debe ser un archivo PNG transparente"}
    
    file_path = os.path.join(FIRMAS_DIR, f"firma_{usuario_id}.png")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Aquí actualizarías la tabla 'usuarios' con la ruta 'file_path'
    return {"mensaje": "Firma guardada correctamente", "path": file_path}