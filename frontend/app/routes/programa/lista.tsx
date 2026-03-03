import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { sstApi } from "~/api/cliente";

export default function NuevaInspeccion() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Estado basado en el esquema InspeccionCreate de tu API
    const [inspeccion, setInspeccion] = useState({
        uuid: uuidv4(),
        ambiente_id: Number(searchParams.get("ambiente_id")) || 0,
        instructor_id: Number(localStorage.getItem("user_id")),
        detalles: [
            { item_id: 1, resultado: "Cumple", observacion: "" }, // Ejemplo inicial
            { item_id: 2, resultado: "Cumple", observacion: "" }
        ]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Llamada al endpoint POST /api/v1/inspecciones
            await sstApi.post("/inspecciones", inspeccion);
            alert("¡Inspección enviada con éxito!");
            navigate("/programa");
        } catch (error) {
            console.error("Error al enviar:", error);
            alert("Hubo un error al procesar la inspección.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6">Registro de Inspección</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {inspeccion.detalles.map((detalle, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="font-medium mb-3">Ítem de Verificación #{detalle.item_id}</p>
                        <div className="flex gap-4 mb-3">
                            {["Cumple", "No Cumple", "N/A"].map((opcion) => (
                                <label key={opcion} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name={`resultado-${index}`}
                                        value={opcion}
                                        checked={detalle.resultado === opcion}
                                        onChange={() => {
                                            const nuevosDetalles = [...inspeccion.detalles];
                                            nuevosDetalles[index].resultado = opcion;
                                            setInspeccion({...inspeccion, detalles: nuevosDetalles});
                                        }}
                                    />
                                    {opcion}
                                </label>
                            ))}
                        </div>
                        <textarea 
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="Observaciones (Opcional)"
                            value={detalle.observacion}
                            onChange={(e) => {
                                const nuevosDetalles = [...inspeccion.detalles];
                                nuevosDetalles[index].observacion = e.target.value;
                                setInspeccion({...inspeccion, detalles: nuevosDetalles});
                            }}
                        />
                    </div>
                ))}
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400"
                >
                    {loading ? "Enviando..." : "Finalizar y Enviar al Inspector"}
                </button>
            </form>
        </div>
    );
}