import { sstApi } from "~/api/cliente";

export const getProgramaUsuario = async (userId: string | number) => {
    // El interceptor en cliente.ts ya se encarga de poner el Token
    const { data } = await sstApi.get(`/usuarios/${userId}/programa`);
    return data;
};