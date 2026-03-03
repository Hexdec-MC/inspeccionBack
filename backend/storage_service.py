from fastapi import APIRouter, UploadFile, File, HTTPException
from database import get_connection
import os
import shutil

router = APIRouter(prefix="/api/v1/admin", tags=["Administración"])

UPLOAD_DIR = "uploads"
FIRMAS_DIR = os.path.join(UPLOAD_DIR, "firmas")
os.makedirs(FIRMAS_DIR, exist_ok=True)

@router.post("/upload-firma/{usuario_id}")
async def upload_firma(usuario_id: int, file: UploadFile = File(...)):
    # 1. Validar extensión
    if not file.filename.lower().endswith(".png"):
        raise HTTPException(status_code=400, detail="La firma debe ser un archivo PNG transparente")
    
    # 2. Definir ruta y guardar archivo
    file_name = f"firma_{usuario_id}.png"
    file_path = os.path.join(FIRMAS_DIR, file_name)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 3. ACTUALIZAR BASE DE DATOS
        conn = get_connection()
        cursor = conn.cursor()
        query = "UPDATE usuarios SET firma_url = %s WHERE id = %s"
        cursor.execute(query, (file_path, usuario_id))
        conn.commit()
        conn.close()
        
        return {"status": "success", "path": file_path, "message": "Firma vinculada al usuario"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar: {str(e)}")