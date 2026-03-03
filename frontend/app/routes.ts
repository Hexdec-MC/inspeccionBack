// app/routes.ts
import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    route("login", "routes/auth/login.tsx"),

    layout("routes/layouts/main-layout.tsx", [
        index("routes/dashboard/home.tsx"),
        route("programa", "routes/programa/lista.tsx"), // <-- Pestaña Mi Programa
        route("inspeccion/nueva", "routes/inspecciones/nuevo-formulario.tsx"), // <-- Pestaña Formulario
        route("admin/items", "routes/admin/carga-excel.tsx"),
    ]),
] satisfies RouteConfig;