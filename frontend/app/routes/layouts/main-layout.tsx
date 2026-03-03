import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router";

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState({ nombre: "", cargo: "" });

// Dentro de MainLayout.tsx
    useEffect(() => {
        const token = localStorage.getItem("sst_token");
        const cargo = localStorage.getItem("user_cargo"); 
        const nombre = localStorage.getItem("user_name");

        if (!token) {
            navigate("/login", { replace: true });
        } else {
            // Forzamos la actualización del estado con los datos del localStorage
            setUser({ 
                nombre: nombre || "Usuario", 
                cargo: cargo || "Sin Cargo" 
            });
        }
    }, [navigate, location.pathname]); // Añadimos location.pathname para re-verificar en cada navegación

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const activeClass = (path: string) => 
        location.pathname === path ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-800";

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* SIDEBAR DINÁMICO */}
            <aside className="w-64 bg-blue-900 shadow-xl flex flex-col">
                <div className="p-6 border-b border-blue-800">
                    <h1 className="text-white text-2xl font-bold tracking-tight">SST SENATI</h1>
                    <p className="text-blue-300 text-xs mt-1 uppercase font-semibold">{user.cargo}</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link to="/" className={`flex items-center p-3 rounded-lg transition-colors ${activeClass("/")}`}>
                        <span className="ml-3">Dashboard</span>
                    </Link>

                    {/* Vistas para Instructor */}
                    {user.cargo === "Instructor" && (
                        <>
                            <Link to="/programa" className={`flex items-center p-3 rounded-lg transition-colors ${activeClass("/programa")}`}>
                                <span className="ml-3">Mi Programa</span>
                            </Link>
                            <Link to="/inspeccion/nueva" className={`flex items-center p-3 rounded-lg transition-colors ${activeClass("/inspeccion/nueva")}`}>
                                <span className="ml-3">Nueva Inspección</span>
                            </Link>
                        </>
                    )}

                    {/* Vistas para Inspector */}
                    {user.cargo === "Inspector" && (
                        <Link to="/revisiones" className={`flex items-center p-3 rounded-lg transition-colors ${activeClass("/revisiones")}`}>
                            <span className="ml-3">Pendientes de Firma</span>
                        </Link>
                    )}

                    {/* Vistas para Admin */}
                    {user.cargo === "Admin" && (
                        <>
                            <Link to="/admin/reportes" className={`flex items-center p-3 rounded-lg transition-colors ${activeClass("/admin/reportes")}`}>
                                <span className="ml-3">Todos los Informes</span>
                            </Link>
                            <Link to="/admin/items" className={`flex items-center p-3 rounded-lg transition-colors ${activeClass("/admin/items")}`}>
                                <span className="ml-3">Gestión de Ítems</span>
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-blue-800 bg-blue-950">
                    <div className="flex items-center mb-4 px-2">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                            {user.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-xs text-white font-medium truncate">{user.nombre}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center p-2 text-red-300 hover:bg-red-900/30 rounded-lg text-sm transition-colors">
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* CONTENIDO */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <div className="text-gray-800 font-medium">
                        Bienvenido, {user.nombre}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <Outlet context={{ user }} />
                    </div>
                </main>
            </div>
        </div>
    );
}