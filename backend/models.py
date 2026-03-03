from pydantic import BaseModel, EmailStr
from typing import List, Optional

# Modelo para el Login
class Login(BaseModel):  # Cambiado de UserLogin a Login
    correo: str # O EmailStr si instalas pydantic[email]
    password: str

# Modelo para los ítems individuales de la inspección
class InspeccionDetalle(BaseModel):
    item_id: int
    resultado: str  # Ejemplo: 'Conforme', 'No Conforme', 'N/A'
    observacion: Optional[str] = None

# Modelo principal para crear una inspección
class InspeccionCreate(BaseModel):
    uuid: str
    ambiente_id: int
    instructor_id: int
    detalles: List[InspeccionDetalle] # Una lista de los objetos definidos arriba