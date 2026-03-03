import { useState } from "react";
import { useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { postInspeccion } from "~/services/inspeccion.service";

export default function NuevoFormulario() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Estado del formulario (Simplificado para el ejemplo)
    const [formData, setFormData] = useState({
        ambiente_id: 1, // Esto podría venir de la URL (?ambiente=X)
        instructor_id: Number(localStorage.getItem("user_id")),
        detalles: [
            { item_id: 1, resultado: "Cumple", observacion: "" },
            { item_id: 2, resultado: "No Cumple", observacion: "" }
        ]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            uuid: uuidv4(), // Generamos el UUID requerido por tu esquema
            ...formData
        };

        try {
            await postInspeccion(payload);
            alert("Inspección guardada con éxito");
            navigate("/programa");
        } catch (error) {
            alert("Error al guardar la inspección");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="bg-blue-700 p-6 text-white">
                <h2 className="text-xl font-bold">Nueva Inspección de Seguridad</h2>
                <p className="text-blue-100 text-sm">Complete los puntos de control del ambiente</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Sección de Ítems */}
                <div className="space-y-4">
                    {formData.detalles.map((detalle, index) => (
                        <div key={detalle.item_id} className="p-4 border rounded-lg bg-gray-50 flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-700">Punto de Control #{detalle.item_id}</p>
                                <input 
                                    type="text"
                                    placeholder="Observación (opcional)"
                                    className="mt-2 w-full p-2 text-sm border rounded"
                                    onChange={(e) => {
                                        const newDetalles = [...formData.detalles];
                                        newDetalles[index].observacion = e.target.value;
                                        setFormData({...formData, detalles: newDetalles});
                                    }}
                                />
                            </div>
                            
                            <div className="flex gap-2">
                                {["Cumple", "No Cumple", "N/A"].map((opcion) => (
                                    <button
                                        key={opcion}
                                        type="button"
                                        onClick={() => {
                                            const newDetalles = [...formData.detalles];
                                            newDetalles[index].resultado = opcion;
                                            setFormData({...formData, detalles: newDetalles});
                                        }}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                            detalle.resultado === opcion 
                                            ? "bg-blue-600 text-white" 
                                            : "bg-white border text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {opcion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t flex justify-end gap-4">
                    <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 text-gray-600 hover:underline"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {loading ? "Enviando..." : "Finalizar Inspección"}
                    </button>
                </div>
            </form>
        </div>
    );
}