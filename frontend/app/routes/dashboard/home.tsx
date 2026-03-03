import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router";
import { sstApi } from "~/api/cliente";

export default function DashboardHome() {
    const { user }: any = useOutletContext();
    const [stats, setStats] = useState<any>({});
    const [actividad, setActividad] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            // VERIFICACIÓN: Solo ejecutamos localStorage si estamos en el cliente
            if (typeof window === "undefined") return;

            try {
                const userId = localStorage.getItem("user_id");
                if (!userId) return;

                // 1. Cargar Estadísticas según el cargo
                let statsEndpoint = "";
                if (user.cargo === "Instructor") statsEndpoint = `/usuarios/${userId}/stats-instructor`;
                else if (user.cargo === "Inspector") statsEndpoint = `/stats/inspector`;
                else if (user.cargo === "Admin") statsEndpoint = `/stats/admin`;

                if (statsEndpoint) {
                    const resStats = await sstApi.get(statsEndpoint);
                    if (resStats.data.status === "success") setStats(resStats.data.data);
                }

                // 2. Cargar Actividad Reciente (Solo para instructores)
                if (user.cargo === "Instructor") {
                    const resAct = await sstApi.get(`/usuarios/${userId}/actividad-reciente`);
                    if (resAct.data.status === "success") setActividad(resAct.data.data);
                }
                
            } catch (error) {
                console.error("Error al cargar datos del dashboard", error);
            }
        };

        if (user.cargo) fetchData();
    }, [user.cargo]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Resumen de Actividades</h1>
                    <p className="text-gray-500">Panel de control para {user.cargo}</p>
                </div>
                {user.cargo === "Instructor" && (
                    <Link to="/programa" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm">
                        + Nueva Inspección
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {user.cargo === "Admin" && (
                    <>
                        <StatCard title="Total Inspecciones" value={stats.total?.toString() || "0"} icon="📊" color="blue" />
                        <StatCard title="Pendientes de Firma" value={stats.pendientes?.toString() || "0"} icon="⏳" color="yellow" />
                        <StatCard title="Sedes Activas" value={stats.extra || "0"} icon="🏢" color="green" />
                    </>
                )}

                {user.cargo === "Instructor" && (
                    <>
                        <StatCard title="Mis Formularios" value={stats.total_enviados?.toString() || "0"} icon="📝" color="blue" />
                        <StatCard title="Falta Firma" value={stats.falta_firma?.toString() || "0"} icon="✍️" color="red" />
                        <StatCard title="Próxima Inspección" value={stats.proxima_fecha || "---"} icon="📅" color="indigo" />
                    </>
                )}

                {user.cargo === "Inspector" && (
                    <>
                        <StatCard title="Por Firmar" value={stats.pendientes?.toString() || "0"} icon="✒️" color="orange" />
                        <StatCard title="Revisados Hoy" value={stats.total_hoy?.toString() || "0"} icon="✅" color="green" />
                        <StatCard title="Alertas SST" value={stats.alertas?.toString() || "0"} icon="⚠️" color="red" />
                    </>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Últimas acciones</h3>
                    <button className="text-xs text-blue-600 hover:underline">Ver todo</button>
                </div>
                
                {user.cargo === "Instructor" && actividad.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-6 py-3">Ambiente</th>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Estado</th>
                                    <th className="px-6 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {actividad.map((item) => (
                                    <tr key={item.uuid} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.nombre_ambiente}</td>
                                        <td className="px-6 py-4 text-gray-600">{new Date(item.fecha_creacion).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                                item.estado === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {item.estado.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => window.open(`http://localhost:8000/api/v1/inspecciones/${item.uuid}/reporte`)} 
                                                className="text-blue-600 hover:text-blue-800 font-bold"
                                            >
                                                PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400 italic">
                        {user.cargo === "Admin" 
                            ? "Mostrando registros globales del sistema..." 
                            : "No hay actividad reciente para mostrar."}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: any) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50",
        yellow: "text-yellow-600 bg-yellow-50",
        green: "text-green-600 bg-green-50",
        red: "text-red-600 bg-red-50",
        indigo: "text-indigo-600 bg-indigo-50",
        orange: "text-orange-600 bg-orange-50",
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center hover:scale-[1.02] transition-transform">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}