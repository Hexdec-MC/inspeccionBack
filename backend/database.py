import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv

load_dotenv()

db_config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "inspeccioninsti") # Asegúrate que coincida con tu SQL
}

# Pool de conexiones para mayor velocidad
connection_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool", 
    pool_size=5, 
    **db_config
)

def get_connection():
    # Esta función ahora devuelve una conexión del pool cada vez que se llama
    return connection_pool.get_connection()