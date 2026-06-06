# Assent Dashboard - Solución Integral de Gestión Empresarial Multi-Tenant

**Assent Dashboard** (también conocido como *panel-control*) es una plataforma de gestión empresarial SaaS (Software as a Service) multi-inquilino de alto rendimiento. Está diseñado para centralizar y optimizar todas las operaciones de un negocio, desde la administración interna y el punto de venta (POS) hasta la facturación electrónica y la creación de sitios web dinámicos y autogestionables para clientes.

El sistema está construido bajo una arquitectura desacoplada moderna: un backend robusto en Python con Django y un frontend híbrido de escritorio (Electron) y web (Vite + React).

---

## 🎯 Misión y Visión

### 🌟 Misión
Empoderar a las micro, pequeñas y medianas empresas (MiPyMEs) y profesionales independientes mediante herramientas tecnológicas avanzadas, intuitivas y centralizadas de nivel empresarial. Buscamos democratizar el acceso al comercio electrónico, la inteligencia artificial, el control financiero y la facturación electrónica legal, eliminando barreras técnicas y de costos para impulsar el crecimiento sostenible y la digitalización de los negocios.

### 🔮 Visión
Convertirse en la plataforma líder e indispensable de gestión de negocios y automatización comercial en América Latina, siendo el motor tecnológico detrás del éxito de millones de negocios. Nos proyectamos como una solución integral que evoluciona constantemente a través de la integración de inteligencia artificial de vanguardia y la adaptabilidad fiscal global, permitiendo a los comerciantes competir a gran escala en un mercado globalizado y digitalizado.

### 🚀 Impacto del Software
Assent Dashboard genera un impacto transformador en múltiples niveles del ecosistema comercial:
*   **Eficiencia Operativa:** Automatiza tareas repetitivas (inventario, arqueo de caja, reportes), ahorrando hasta un 30% del tiempo diario de administración del negocio.
*   **Cumplimiento Fiscal sin Estrés:** Facilita la transición digital de la facturación obligatoria (por ejemplo, con la DIAN en Colombia), previniendo sanciones fiscales de forma automatizada y sin requerir conocimientos técnicos.
*   **Expansión e Ingresos:** Permite a comercios locales vender en línea en cuestión de minutos gracias al constructor web integrado y plantillas premium, abriendo nuevos canales de venta e incrementando la visibilidad de la marca.
*   **Toma de Decisiones Inteligente:** Traduce datos complejos de ventas en reportes interactivos asistidos por Inteligencia Artificial, proporcionando recomendaciones estratégicas en tiempo real equivalentes a tener un consultor de negocios integrado.

---

## 🏗️ Arquitectura y Tecnologías Clave

### 1. Backend (Django REST Framework)
Ubicado en el directorio `/backend`, es el núcleo de la lógica de negocios y almacenamiento.
*   **Framework Principal**: Django (v5.2.6) y Django REST Framework (DRF) para APIs REST seguras y rápidas.
*   **Arquitectura Multi-Inquilino (Multi-Tenant)**: Aislamiento completo de datos por cliente (tenant) utilizando bases de datos independientes (`db_path` y `db_alias`).
*   **Seguridad y Cifrado**:
    *   Autenticación basada en JSON Web Tokens (JWT) con `djangorestframework-simplejwt`.
    *   Cifrado de datos sensibles en reposo (como teléfonos y direcciones de usuarios) mediante criptografía simétrica antes de almacenarse en la base de datos.
    *   Gestión de Roles (RBAC): Super Administrador, Administrador, Empleador y Empleado.
*   **Base de Datos**: Soporte para PostgreSQL en entornos de producción y SQLite para base de datos local o de inquilinos.

### 2. Frontend (React + Electron + TypeScript)
Ubicado en el directorio `/frontend`, es la aplicación de interfaz de usuario de nivel empresarial.
*   **Entorno de Ejecución**: Aplicación nativa de escritorio multiplataforma (Windows, macOS, Linux) mediante **Electron**, y versión para la web (`dist-web`) usando **Vite**.
*   **Librerías de Interfaz**: React, TypeScript, Tailwind CSS, y componentes visuales con animaciones fluidas usando **Framer Motion**.
*   **Características UX**:
    *   Arrastrar y soltar (Drag and Drop) con `@dnd-kit/core` para personalización y orden.
    *   Internacionalización (i18n) completa con `i18next`.
    *   Gráficos dinámicos y reportes con `Chart.js`.
    *   Exportación de reportes a PDF (`jspdf`) y Excel (`xlsx`).

---

## 🖥️ Detalle de Páginas y Módulos del Panel de Control

### 1. 📊 Panel Principal / Dashboard (`Dashboard.tsx`)
*   **Función**: Centro de control visual al ingresar a la plataforma.
*   **Detalles**: Ofrece widgets dinámicos e interactivos que resumen las ventas del día, el margen de ganancias, la cantidad de órdenes web pendientes y el estado de stock crítico. Incluye gráficos analíticos de desempeño de ventas semanales o mensuales.

### 2. 💰 Punto de Venta (POS) y Gestión de Caja
*   **Gestión de Ventas (`SalesPage.tsx`)**: Interfaz rápida adaptada a pantallas táctiles y teclado para registrar transacciones de mostrador. Permite buscar productos por nombre o código de barras, aplicar descuentos, seleccionar métodos de pago (efectivo, tarjetas, transferencias) y realizar la venta en segundos.
*   **Control de Caja (`CashboxPage.tsx`)**: Control estricto de dinero. Permite abrir y cerrar turnos de caja, registrar entradas y salidas de efectivo manuales y realizar arqueos de caja exactos para evitar discrepancias de caja.

### 3. 📦 Gestión de Inventario y Catálogos
*   **Gestión de Productos (`ProductosManager.tsx`, `ProductFormPage.tsx`)**: Lista completa y detallada de productos. El formulario de creación permite especificar nombre, SKU, código de barras, costo de compra, precio de venta, control de existencias mínimas de alerta, categorías y carga de imágenes.
*   **Gestión de Categorías (`CategoriesManager.tsx`)**: Organización jerárquica de artículos, asignación de colores personalizados y ordenamiento visual por arrastrar y soltar.

### 4. 👥 Módulo de Clientes (CRM) (`ClientsPage.tsx`, `ClientDetailsPage.tsx`)
*   **Función**: Gestión y fidelización de clientes.
*   **Detalles**: Directorio completo con información de contacto, historial de compras detallado de cada cliente y control de saldos y créditos pendientes para negocios que venden bajo modalidad de cuentas corrientes ("fiado").

### 5. 🛠️ Gestión de Servicios y Reservas (`ServicesPage.tsx`, `FullServiceFormPage.tsx`)
*   **Función**: Diseñado para negocios basados en servicios (salones de belleza, talleres, consultorios, etc.).
*   **Detalles**: Permite configurar un catálogo de servicios con duraciones específicas, precios, y asignar el personal calificado que los realiza, ayudando a agendar y dar seguimiento a los turnos.

### 6. 🌐 Constructor y Administrador Web (`WebPageManager.tsx`)
*   **Función**: Editor visual autogestionable para que el inquilino configure su propia tienda virtual o landing page.
*   **Submódulos Especializados**:
    *   `WebProductsPage` / `WebCategoriesPage`: Filtra y decide qué productos y categorías del inventario principal estarán visibles en el sitio web de ventas.
    *   `WebOffersPage`: Configuración de banners promocionales y cupones de descuento.
    *   `WebPaymentsPage`: Configuración y vinculación de pasarelas de pago online (Stripe y MercadoPago).
    *   `WebShippingPage`: Definición de tarifas y métodos de envío.
    *   `WebUrlsPage`: Configuración de subdominios del negocio y enlaces amigables.

### 7. 📄 Gestión de Órdenes Web (`OrdersPage.tsx`)
*   **Función**: Tablero Kanban para rastrear y procesar compras entrantes de la tienda virtual.
*   **Detalles**: Permite cambiar el estado de las órdenes en tiempo real (Pendiente ➡️ Preparación ➡️ Enviado ➡️ Entregado) e informar automáticamente al cliente final.

### 8. 🤖 Asistente de Inteligencia Artificial (`AIChatAssistant.tsx`)
*   **Función**: Consultor de negocios basado en inteligencia artificial (Google Gemini).
*   **Detalles**: Interfaz de chat donde el comerciante puede preguntar dudas de negocio ("¿Cómo puedo mejorar mis ventas de ropa este mes?", "¿Qué productos tienen menor rotación?"), redactar copys de marketing para banners del sitio web o pedir ayuda en la configuración del panel.

### 9. ⚙️ Configuraciones del Negocio e Integraciones (`ConfigPage.tsx`, `GoogleConfig.tsx`)
*   **Función**: Panel de ajustes globales del sistema.
*   **Detalles**: Configuración de información legal de la empresa, vinculación con impresoras térmicas locales, parametrización de impuestos de facturación y conexión con Google APIs (Google Drive, OAuth y servicios de correo).

### 10. 👑 Panel de Super Administrador (`SuperAdminWebRequests.tsx`)
*   **Función**: Dashboard exclusivo para los propietarios del software Assent Dashboard.
*   **Detalles**: Permite supervisar todos los inquilinos creados, administrar solicitudes de subdominios personalizados, planes de suscripción activos y controlar solicitudes de soporte.

---

## 🎨 Catálogo de Plantillas Web (`/Paginas`)

El constructor web genera de forma dinámica tiendas de alto impacto estético usando plantillas pre-diseñadas y optimizadas para conversión:
1.  **`charis-luxe-elegance`**: Plantilla premium diseñada para marcas elegantes y de lujo (joyería, relojería, moda de alta gama) con animaciones suaves de transición y galerías sofisticadas.
2.  **`kooat-shop-clean`**: Diseño moderno, minimalista y ultra rápido enfocado en la claridad del producto, excelente para tiendas generales de e-commerce y facilidad de compra móvil.
3.  **`burbuja`**: Plantilla divertida y colorida, ideal para reposterías, jugueterías o tiendas de regalos.
4.  **`asenting`**: Landing page oficial corporativa de la plataforma de cara al público para captar nuevos inquilinos y comercializar el software.
5.  **`Viral`**: Plantilla adaptativa y dinámica para e-commerce de productos en tendencia y ofertas rápidas.

---

## ⚙️ Estructura del Repositorio

*   📁 `backend/`: Código fuente en Python, configuraciones de Django, migración de base de datos, módulos de facturación electrónica y servicios de IA.
*   📁 `frontend/`: Código fuente de la aplicación de escritorio y web en React, TypeScript y Electron.
*   📁 `Paginas/`: Plantillas web estáticas y e-commerce autogenerables para los sitios web de los clientes.
*   📁 `_backend_publish/`: Espacio destinado para los paquetes listos de distribución o despliegues del servidor.

---
*Este documento se mantiene actualizado conforme evoluciona la arquitectura técnica del sistema Assent Dashboard.*
