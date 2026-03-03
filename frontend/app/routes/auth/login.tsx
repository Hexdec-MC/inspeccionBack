import { useState } from "react";
import { data, redirect, useFetcher } from "react-router";
import { loginService } from "~/services/auth.service";
import type { Route } from "./+types/login";

// El 'action' maneja el envío del formulario de forma asíncrona
export async function clientAction({ request }: Route.ClientActionArgs) {
    const formData = await request.formData();
    const correo = formData.get("correo") as string;
    const password = formData.get("password") as string;

    try {
            const response = await loginService(correo, password);
            const usuario = response.data; // Tu API envuelve todo en 'data'

            // Guardamos los datos que devuelve tu SELECT de MySQL
            localStorage.setItem("sst_token", "fake-jwt-token"); // Tu API actual no genera JWT, pon uno temporal
            localStorage.setItem("user_id", usuario.id.toString());
            localStorage.setItem("user_name", usuario.nombre);

            return redirect("/");
    } catch (error: any) {
        return data(
            { error: error.response?.data?.detail || "Credenciales incorrectas" },
            { status: 401 }
        );
    }
}

export default function Login() {
    const fetcher = useFetcher();
    const isLoggingIn = fetcher.state !== "idle";

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-800">SST SENATI</h1>
                    <p className="text-gray-500">Inicie sesión para continuar</p>
                </div>

                <fetcher.Form method="post" className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Correo Institucional</label>
                        <input
                            name="correo"
                            type="email"
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="ejemplo@senati.pe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {fetcher.data?.error && (
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {fetcher.data.error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full py-2 text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:bg-blue-400 transition-colors"
                    >
                        {isLoggingIn ? "Autenticando..." : "Ingresar"}
                    </button>
                </fetcher.Form>
            </div>
        </div>
    );
}