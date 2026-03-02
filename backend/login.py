from pydantic import BaseModel

class UserLogin(BaseModel):
    correo: str
    password: str

@app.post("/login")
def login(user: UserLogin):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Buscamos el usuario y su cargo 
    cursor.execute("SELECT id, nombre, cargo, firma_url FROM usuarios WHERE correo_insti = %s", (user.correo,))
    usuario = cursor.fetchone()
    conn.close()
    
    if usuario:
        # En React, guardarás este 'cargo' para redirigir al Dashboard correcto
        return usuario 
    return {"error": "Usuario no encontrado"}