import { useState } from "react";
import { sstApi } from "~/api/cliente";

export default function CargaExcel() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setStatus(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setStatus(null);

        // Preparamos el FormData según requiere tu esquema OpenAPI
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await sstApi.post("/admin/upload-items", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.status === "success") {
                setStatus({ type: "success", msg: res.data.message });
                setFile(null);
            }
        } catch (error: any) {
            console.error("Error al subir archivo", error);
            setStatus({ 
                type: "error", 
                msg: error.response?.data?.detail || "Error al procesar el archivo Excel" 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Carga Masiva de Ítems</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Sube un archivo Excel (.xlsx) con el formato establecido para actualizar la lista de verificación.
                    </p>
                </div>

                <form onSubmit={handleUpload} className="space-y-6">
                    {/* ZONA DE CARGA */}
                    <div className={`relative border-2 border-dashed rounded-xl p-10 transition-colors flex flex-col items-center justify-center ${
                        file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-blue-400 bg-gray-50"
                    }`}>
                        <input 
                            type="file" 
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="text-4xl mb-4">{file ? "📄" : "📥"}</div>
                        <p className="text-sm font-medium text-gray-700 text-center">
                            {file ? file.name : "Arrastra tu archivo aquí o haz clic para seleccionar"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Formato permitido: Excel (.xlsx)</p>
                    </div>

                    {/* MENSAJES DE ESTADO */}
                    {status && (
                        <div className={`p-4 rounded-lg text-sm font-medium ${
                            status.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                            {status.type === "success" ? "✅" : "❌"} {status.msg}
                        </div>
                    )}

                    {/* BOTÓN DE ACCIÓN */}
                    <button
                        type="submit"
                        disabled={!file || loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:bg-gray-300 transition-all flex justify-center items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin">🌀</span> Procesando...
                            </>
                        ) : (
                            "Subir e Importar Ítems"
                        )}
                    </button>
                </form>
            </div>

            {/* NOTA INFORMATIVA */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                    💡 Instrucciones para el Administrador
                </h4>
                <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc ml-4">
                    <li>El archivo debe contener las columnas: Código, Descripción y Categoría.</li>
                    <li>Esta acción actualizará los ítems existentes o agregará nuevos.</li>
                    <li>Asegúrese de que el archivo no esté protegido por contraseña.</li>
                </ul>
            </div>
        </div>
    );
}