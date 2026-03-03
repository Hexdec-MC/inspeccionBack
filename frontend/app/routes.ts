import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    // Ruta de Login: Independiente, sin Sidebar
    route("login", "routes/auth/login.tsx"),

    // Rutas protegidas: Envueltas en el MainLayout
    layout("routes/layouts/main-layout.tsx", [
        index("routes/dashboard/home.tsx"),
        route("inspeccion/nueva", "routes/inspecciones/nuevo-formulario.tsx"),
        route("programa", "routes/programa/lista.tsx"),
        /* route("admin/items", "routes/admin/carga-excel.tsx"), */
    ]),
] satisfies RouteConfig;