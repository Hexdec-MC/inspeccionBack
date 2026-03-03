import { useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router";

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Guardia de Navegación: Si no hay token, fuera.
    useEffect(() => {
        const token = localStorage.getItem("sst_token");
        if (!token) {
            navigate("/login", { replace: true });
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // Helper para marcar el link activo en el menú
    const activeClass = (path: string) => 
        location.pathname === path ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-800";

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* SIDEBAR */}
            <aside className="w-64 bg-blue-900 shadow-xl flex flex-col">
                <div className="p-6">
                    <h1 className="text-white text-2xl font-bold tracking-tight">SST SENATI</h1>
                    <p className="text-blue-300 text-xs mt-1">Panel de Inspecciones</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link to="/" className={`flex items-center p-3 rounded-lg transition-colors ${activeClass("/")}`}>
                        <span className="ml-3">Dashboard</span>
                    </Link>
                    <Link to="/programa" className={`flex items-center p-3 rounded-lg transition-colors ${activeClass("/programa")}`}>
                        <span className="ml-3">Mi Programa</span>
                    </Link>
                    <Link to="/inspeccion/nueva" className={`flex items-center p-3 rounded-lg transition-colors ${activeClass("/inspeccion/nueva")}`}>
                        <span className="ml-3">Nueva Inspección</span>
                    </Link>
                    <Link to="/admin/items" className={`flex items-center p-3 rounded-lg transition-colors ${activeClass("/admin/items")}`}>
                        <span className="ml-3">Gestión de Ítems</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-blue-800">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center p-3 text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                        <span className="ml-3 font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* HEADER */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <div className="flex items-center">
                        <span className="text-gray-500 mr-2">Ruta:</span>
                        <span className="text-gray-800 font-medium capitalize">
                            {location.pathname === "/" ? "Inicio" : location.pathname.split("/").pop()}
                        </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-700">Instructor SENATI</p>
                            <p className="text-xs text-gray-500">Sesión Activa</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            IS
                        </div>
                    </div>
                </header>

                {/* VISTA DE LA RUTA HIJA */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}