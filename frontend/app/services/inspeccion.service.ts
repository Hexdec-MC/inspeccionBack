// services/inspeccion.service.ts
import { sstApi } from "~/api/cliente";

export interface InspeccionDetalle {
  item_id: number;
  resultado: string;
  observacion?: string | null;
}

export interface InspeccionCreate {
  uuid: string;
  ambiente_id: number;
  instructor_id: number;
  detalles: InspeccionDetalle[];
}

export const createInspeccion = async (data: InspeccionCreate) => {
    const response = await sstApi.post("/inspecciones", data);
    return response.data;
};

export const getSedes = async () => {
    const response = await sstApi.get("/sedes");
    return response.data;
};
export const postInspeccion = async (payload: any) => {
    // Endpoint: POST /api/v1/inspecciones
    const { data } = await sstApi.post("/inspecciones", payload);
    return data;
};

export const getItemsVerificacion = async () => {
    // Este endpoint debería retornar la lista de preguntas/ítems
    const { data } = await sstApi.get("/admin/items-lista"); 
    return data;
};

export const getAmbientes = async (sedeId: number) => {
    const { data } = await sstApi.get(`/ambientes?sede_id=${sedeId}`);
    return data;
};
