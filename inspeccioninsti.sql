-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-03-2026 a las 11:50:22
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `inspeccioninsti`
--
CREATE DATABASE IF NOT EXISTS `inspeccioninsti` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `inspeccioninsti`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `acciones_correctivas`
--

DROP TABLE IF EXISTS `acciones_correctivas`;
CREATE TABLE `acciones_correctivas` (
  `id` int(11) NOT NULL,
  `inspeccion_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `accion_tomar` text NOT NULL,
  `plazo` date NOT NULL,
  `estado_seguimiento` enum('Pendiente','En Proceso','Corregido') DEFAULT 'Pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ambientes`
--

DROP TABLE IF EXISTS `ambientes`;
CREATE TABLE `ambientes` (
  `id` int(11) NOT NULL,
  `area_id` int(11) DEFAULT NULL,
  `nombre_ambiente` varchar(100) NOT NULL,
  `codigo_ambiente` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ambientes`
--

INSERT INTO `ambientes` (`id`, `area_id`, `nombre_ambiente`, `codigo_ambiente`) VALUES
(1, 1, 'Mecánica de Ajuste', 'MA-01'),
(2, 2, 'Laboratorio 302', 'LAB-302');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `seccion` enum('I Condiciones subestándares','II Actos subestándares') NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `seccion`, `nombre`) VALUES
(1, 'I Condiciones subestándares', 'Protección contra incendios'),
(2, 'I Condiciones subestándares', 'Instalaciones Eléctricas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inspecciones`
--

DROP TABLE IF EXISTS `inspecciones`;
CREATE TABLE `inspecciones` (
  `id` int(11) NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `ambiente_id` int(11) DEFAULT NULL,
  `instructor_id` int(11) DEFAULT NULL,
  `inspector_id` int(11) DEFAULT NULL,
  `fecha_creacion` date NOT NULL,
  `estado` enum('Borrador','Enviado','Observado','Finalizado') DEFAULT 'Borrador',
  `observaciones_generales` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inspeccion_detalles`
--

DROP TABLE IF EXISTS `inspeccion_detalles`;
CREATE TABLE `inspeccion_detalles` (
  `id` int(11) NOT NULL,
  `inspeccion_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `resultado` enum('Conforme','No Conforme','No Aplica') NOT NULL,
  `observacion` text DEFAULT NULL,
  `evidencia_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `items_verificacion`
--

DROP TABLE IF EXISTS `items_verificacion`;
CREATE TABLE `items_verificacion` (
  `id` int(11) NOT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `codigo` varchar(10) NOT NULL,
  `descripcion` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `items_verificacion`
--

INSERT INTO `items_verificacion` (`id`, `categoria_id`, `codigo`, `descripcion`) VALUES
(1, 1, '1.1', 'Extintores con carga vigente y señalizados'),
(2, 1, '1.2', 'Libre acceso a los extintores'),
(3, 2, '4.1', 'Tableros eléctricos con señalización de riesgo'),
(4, 2, '4.2', 'Cables expuestos o en mal estado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programa`
--

DROP TABLE IF EXISTS `programa`;
CREATE TABLE `programa` (
  `id` int(11) NOT NULL,
  `ambiente_id` int(11) DEFAULT NULL,
  `instructor_id` int(11) DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `tipo_inspeccion` enum('Ordinaria','Inopinada') DEFAULT 'Ordinaria',
  `estado` enum('Pendiente','Realizada','Cancelada') DEFAULT 'Pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `programa`
--

INSERT INTO `programa` (`id`, `ambiente_id`, `instructor_id`, `fecha_programada`, `tipo_inspeccion`, `estado`) VALUES
(1, 1, 1, '2026-03-05', '', 'Pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sedes_areas`
--

DROP TABLE IF EXISTS `sedes_areas`;
CREATE TABLE `sedes_areas` (
  `id` int(11) NOT NULL,
  `nombre_sede` varchar(100) NOT NULL,
  `nombre_area` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sedes_areas`
--

INSERT INTO `sedes_areas` (`id`, `nombre_sede`, `nombre_area`) VALUES
(1, 'Lima - Independencia', 'Taller de Mecánica'),
(2, 'Lima - Independencia', 'Laboratorio de Software');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo_insti` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `cargo` enum('Instructor','Inspector','Administrador') NOT NULL,
  `firma_url` varchar(255) DEFAULT NULL,
  `area_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `correo_insti`, `password_hash`, `cargo`, `firma_url`, `area_id`) VALUES
(1, 'Admin SST', 'admin@senati.pe', 'admin123', 'Administrador', NULL, NULL),
(2, 'Juan Instructor', 'juan@senati.pe', 'inst123', 'Instructor', NULL, 1),
(3, 'Pedro Inspector', 'pedro@senati.pe', 'insp123', 'Inspector', NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `acciones_correctivas`
--
ALTER TABLE `acciones_correctivas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_acc_insp` (`inspeccion_id`),
  ADD KEY `fk_acc_item` (`item_id`);

--
-- Indices de la tabla `ambientes`
--
ALTER TABLE `ambientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ambiente_area` (`area_id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `inspecciones`
--
ALTER TABLE `inspecciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `fk_insp_amb` (`ambiente_id`),
  ADD KEY `fk_insp_inst` (`instructor_id`),
  ADD KEY `fk_insp_insp` (`inspector_id`);

--
-- Indices de la tabla `inspeccion_detalles`
--
ALTER TABLE `inspeccion_detalles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_det_insp` (`inspeccion_id`),
  ADD KEY `fk_det_item` (`item_id`);

--
-- Indices de la tabla `items_verificacion`
--
ALTER TABLE `items_verificacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `fk_item_cat` (`categoria_id`);

--
-- Indices de la tabla `programa`
--
ALTER TABLE `programa`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_prog_amb` (`ambiente_id`),
  ADD KEY `fk_prog_inst` (`instructor_id`);

--
-- Indices de la tabla `sedes_areas`
--
ALTER TABLE `sedes_areas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo_insti` (`correo_insti`),
  ADD KEY `fk_user_area` (`area_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `acciones_correctivas`
--
ALTER TABLE `acciones_correctivas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ambientes`
--
ALTER TABLE `ambientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `inspecciones`
--
ALTER TABLE `inspecciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inspeccion_detalles`
--
ALTER TABLE `inspeccion_detalles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `items_verificacion`
--
ALTER TABLE `items_verificacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `programa`
--
ALTER TABLE `programa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `sedes_areas`
--
ALTER TABLE `sedes_areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `acciones_correctivas`
--
ALTER TABLE `acciones_correctivas`
  ADD CONSTRAINT `fk_acc_insp` FOREIGN KEY (`inspeccion_id`) REFERENCES `inspecciones` (`id`),
  ADD CONSTRAINT `fk_acc_item` FOREIGN KEY (`item_id`) REFERENCES `items_verificacion` (`id`);

--
-- Filtros para la tabla `ambientes`
--
ALTER TABLE `ambientes`
  ADD CONSTRAINT `fk_ambiente_area` FOREIGN KEY (`area_id`) REFERENCES `sedes_areas` (`id`);

--
-- Filtros para la tabla `inspecciones`
--
ALTER TABLE `inspecciones`
  ADD CONSTRAINT `fk_insp_amb` FOREIGN KEY (`ambiente_id`) REFERENCES `ambientes` (`id`),
  ADD CONSTRAINT `fk_insp_insp` FOREIGN KEY (`inspector_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `fk_insp_inst` FOREIGN KEY (`instructor_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `inspeccion_detalles`
--
ALTER TABLE `inspeccion_detalles`
  ADD CONSTRAINT `fk_det_insp` FOREIGN KEY (`inspeccion_id`) REFERENCES `inspecciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_det_item` FOREIGN KEY (`item_id`) REFERENCES `items_verificacion` (`id`);

--
-- Filtros para la tabla `items_verificacion`
--
ALTER TABLE `items_verificacion`
  ADD CONSTRAINT `fk_item_cat` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);

--
-- Filtros para la tabla `programa`
--
ALTER TABLE `programa`
  ADD CONSTRAINT `fk_prog_amb` FOREIGN KEY (`ambiente_id`) REFERENCES `ambientes` (`id`),
  ADD CONSTRAINT `fk_prog_inst` FOREIGN KEY (`instructor_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_user_area` FOREIGN KEY (`area_id`) REFERENCES `sedes_areas` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
