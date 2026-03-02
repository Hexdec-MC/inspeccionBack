from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Login(BaseModel):
    correo: EmailStr # Valida automáticamente el formato de email
    password: str

class DetalleItem(BaseModel):
    item_id: int
    resultado: str  # Conforme, No Conforme, No Aplica
    observacion: Optional[str] = None
    evidencia_url: Optional[str] = None

class InspeccionCreate(BaseModel):
    uuid: str
    ambiente_id: int
    instructor_id: int
    detalles: List[DetalleItem]