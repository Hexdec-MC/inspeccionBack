// app/services/auth.service.ts
import { sstApi } from "~/api/cliente";

export const loginService = async (correo: string, password: string) => {
    const { data } = await sstApi.post("/auth/login", { correo, password });
    return data; // Esto debería retornar tu token y datos del usuario
};