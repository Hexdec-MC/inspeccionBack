import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./app.css";

export default function App() {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Aquí se renderizan el Login o el MainLayout según la URL */}
        <Outlet /> 
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}