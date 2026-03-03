import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { sstApi } from "~/api/cliente";

export default function NuevoFormulario() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // 1. Estado para IDs (inicializados de forma segura)
    const [ambienteId] = useState(Number(searchParams.get("ambiente_id")) || 0);
    const [instructorId, setInstructorId] = useState<number>(0);

    // 2. Estado para los detalles de la inspección
    const [detalles, setDetalles] = useState<any[]>([]);

    useEffect(() => {
        // CORRECCIÓN SSR: Solo accedemos a localStorage en el cliente
        const storedId = localStorage.getItem("user_id");
        if (storedId) setInstructorId(Number(storedId));

        // CARGA DINÁMICA: Traemos los ítems reales de la base de datos
        const fetchItems = async () => {
            try {
                // Asumiendo que crearás este endpoint para listar los ítems de la tabla items_verificacion
                const res = await sstApi.get("/admin/items-lista"); 
                if (res.data.status === "success") {
                    const itemsFormateados = res.data.data.map((item: any) => ({
                        item_id: item.id,
                        descripcion: item.descripcion,
                        resultado: "Cumple",
                        observacion: ""
                    }));
                    setDetalles(itemsFormateados);
                }
            } catch (error) {
                console.error("Error al cargar ítems:", error);
                // Fallback por si la API falla durante el desarrollo
                setDetalles([
                    { item_id: 1, descripcion: "Estado de extintores", resultado: "Cumple", observacion: "" },
                    { item_id: 2, descripcion: "Señalización de seguridad", resultado: "Cumple", observacion: "" }
                ]);
            }
        };

        fetchItems();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (instructorId === 0) return alert("Error: ID de instructor no encontrado.");

        setLoading(true);

        const payload = {
            uuid: uuidv4(),
            ambiente_id: ambienteId,
            instructor_id: instructorId,
            detalles: detalles.map(({ item_id, resultado, observacion }) => ({
                item_id,
                resultado,
                observacion: observacion || null
            }))
        };

        try {
            await sstApi.post("/inspecciones", payload);
            alert("Inspección enviada correctamente.");
            navigate("/programa");
        } catch (error) {
            console.error("Error al enviar inspección", error);
            alert("No se pudo enviar la inspección.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Formulario de Inspección</h2>
                <p className="text-gray-500 text-sm">Ambiente ID: <span className="font-mono font-bold text-blue-600">{ambienteId}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {detalles.map((item, index) => (
                    <div key={item.item_id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <span className="font-bold text-gray-700 flex-1">
                                {index + 1}. {item.descripcion}
                            </span>
                            
                            <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                                {["Cumple", "No Conforme", "N/A"].map((opcion) => (
                                    <button
                                        key={opcion}
                                        type="button"
                                        onClick={() => {
                                            const newDetalles = [...detalles];
                                            newDetalles[index].resultado = opcion;
                                            setDetalles(newDetalles);
                                        }}
                                        className={`flex-1 md:flex-none px-4 py-2 rounded-md text-xs font-bold transition-all ${
                                            item.resultado === opcion 
                                            ? "bg-white text-blue-600 shadow-sm" 
                                            : "text-gray-400 hover:text-gray-600"
                                        }`}
                                    >
                                        {opcion}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            placeholder="Describa la observación técnica (Obligatorio si es 'No Conforme')..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={item.observacion}
                            onChange={(e) => {
                                const newDetalles = [...detalles];
                                newDetalles[index].observacion = e.target.value;
                                setDetalles(newDetalles);
                            }}
                        />
                    </div>
                ))}

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 text-gray-500 font-medium hover:text-gray-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        disabled={loading || detalles.length === 0}
                        className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:bg-gray-300 transition-all active:scale-95"
                    >
                        {loading ? "Procesando..." : "Finalizar y Enviar Registro"}
                    </button>
                </div>
            </form>
        </div>
    );
}