import pandas as pd
from fastapi import HTTPException

def procesar_excel_anexo(file, db_conn):
    try:
        # Es vital especificar el motor para archivos .xlsx
        df = pd.read_excel(file.file, engine='openpyxl') 
        cursor = db_conn.cursor()

        for _, fila in df.iterrows():
            # 1. Insertar Categoría (Sección y Nombre)
            cursor.execute(
                "INSERT IGNORE INTO categorias (seccion, nombre) VALUES (%s, %s)",
                (fila['seccion'], fila['categoria'])
            )
            
            # Recuperar el ID (sea nuevo o existente)
            cursor.execute("SELECT id FROM categorias WHERE nombre = %s", (fila['categoria'],))
            resultado = cursor.fetchone()
            if not resultado:
                continue # Saltar si hubo un error crítico con la categoría
            cat_id = resultado[0]

            # 2. Insertar Ítem (Uso de ON DUPLICATE KEY para actualizar cambios)
            cursor.execute(
                """INSERT INTO items_verificacion (categoria_id, codigo, descripcion) 
                   VALUES (%s, %s, %s) 
                   ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion)""",
                (cat_id, str(fila['codigo']), fila['descripcion'])
            )
            
        db_conn.commit()
        cursor.close() # Siempre cierra el cursor
        return len(df)
    except Exception as e:
        db_conn.rollback() # Si falla algo, deshace los cambios
        raise HTTPException(status_code=400, detail=f"Error en Excel: {str(e)}")