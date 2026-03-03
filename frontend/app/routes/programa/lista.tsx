import { useLoaderData } from "react-router";
import { getProgramaUsuario } from "~/services/programa.service";
import type { Route } from "./+types/lista";

export async function clientLoader() {
    const userId = localStorage.getItem("user_id");
    if (!userId) throw new Error("No se encontró ID de usuario");
    
    // Tu API devuelve { status: "success", data: [...], message: "" }
    const response = await getProgramaUsuario(userId);
    return { programa: response.data || [] };
}

export default function ListaPrograma() {
    const { programa } = useLoaderData<typeof clientLoader>();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Mi Programa de Inspecciones</h2>
                    <p className="text-gray-500 text-sm">Gestiona tus tareas programadas</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {programa.length} Asignadas
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {programa.map((item: any) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {item.tipo_inspeccion?.toUpperCase() || 'GENERAL'}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.estado === 'pendiente' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                                {item.estado?.toUpperCase()}
                            </span>
                        </div>
                        
                        {/* Ajuste de nombres según tu SELECT de MySQL */}
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {item.nombre_ambiente || "Ambiente no especificado"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Sede/Área: <span className="font-medium">{item.nombre_sede || "N/A"}</span>
                        </p>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-5 pb-4 border-b border-gray-50">
                            <span className="flex items-center gap-1">
                                📅 Límite: {item.fecha_programada ? new Date(item.fecha_programada).toLocaleDateString() : 'Sin fecha'}
                            </span>
                        </div>

                        <button 
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 active:transform active:scale-95 transition-all text-sm"
                            onClick={() => window.location.href = `/inspeccion/nueva?ambiente=${item.ambiente_id}`}
                        >
                            Comenzar Inspección
                        </button>
                    </div>
                ))}

                {programa.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-100">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-gray-500 font-medium">No tienes inspecciones programadas.</p>
                        <p className="text-gray-400 text-sm">Buen trabajo, estás al día.</p>
                    </div>
                )}
            </div>
        </div>
    );
}