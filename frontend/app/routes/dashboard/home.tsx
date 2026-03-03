export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Inspecciones Hoy</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">12</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Pendientes</h3>
          <p className="text-4xl font-bold text-yellow-500 mt-2">5</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Completadas</h3>
          <p className="text-4xl font-bold text-green-500 mt-2">85%</p>
        </div>
      </div>
    </div>
  );
}