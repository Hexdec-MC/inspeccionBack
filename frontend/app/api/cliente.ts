import axios from "axios";

// Instancia base configurada para el backend de SST SENATI
export const sstApi = axios.create({
    baseURL: "http://localhost:8000/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * INTERCEPTOR DE PETICIÓN
 * Se ejecuta antes de que la solicitud salga hacia el servidor.
 * Aquí inyectamos el token de autenticación si existe en el almacenamiento local.
 */
sstApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("sst_token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * INTERCEPTOR DE RESPUESTA
 * Se ejecuta cuando el servidor responde.
 * Ideal para manejar errores globales como el 401 (No autorizado).
 */
sstApi.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el servidor responde con 401, el token es inválido o expiró
        if (error.response?.status === 401) {
            console.warn("Sesión expirada o no autorizada. Redirigiendo al login...");
            localStorage.removeItem("sst_token");
            
            // Solo redirigir si no estamos ya en la página de login para evitar bucles
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        }
        
        // Manejo amigable de errores de red o servidor no disponible
        if (!error.response) {
            console.error("Error de conexión con el servidor. Verifica que el backend esté corriendo.");
        }

        return Promise.reject(error);
    }
);