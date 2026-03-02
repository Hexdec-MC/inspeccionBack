import pandas as pd
from fastapi import HTTPException
from database import get_connection

def procesar_excel_anexo(file, db_conn):
    try:
        df = pd.read_excel(file.file)
        cursor = db_conn.cursor()

        for _, fila in df.iterrows():
            # 1. Insertar Categoría
            cursor.execute(
                "INSERT IGNORE INTO categorias (seccion, nombre) VALUES (%s, %s)",
                (fila['seccion'], fila['categoria'])
            )
            cursor.execute("SELECT id FROM categorias WHERE nombre = %s", (fila['categoria'],))
            cat_id = cursor.fetchone()[0]

            # 2. Insertar Ítem
            cursor.execute(
                """INSERT INTO items_verificacion (categoria_id, codigo, descripcion) 
                   VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion)""",
                (cat_id, str(fila['codigo']), fila['descripcion'])
            )
        db_conn.commit()
        return len(df)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en Excel: {str(e)}")