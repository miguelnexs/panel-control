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
*   **Cumplimiento Fiscal sin Estrés:** Facilita la transición digital de la facturación obligatoria (por ejemplo, con la DIAN en Colombia) a través de integraciones nativas con APIs de facturación (Alegra), previniendo sanciones fiscales de forma automatizada y sin requerir conocimientos técnicos.
*   **Expansión e Ingresos:** Permite a comercios locales vender en línea en cuestión de minutos gracias al constructor web integrado y plantillas premium, abriendo nuevos canales de venta e incrementando la visibilidad de la marca.
*   **Toma de Decisiones Inteligente:** Traduce datos complejos de ventas en reportes interactivos asistidos por Inteligencia Artificial, proporcionando recomendaciones estratégicas en tiempo real equivalentes a tener un consultor de negocios integrado.

---

## 🏗️ Arquitectura y Tecnologías Clave

### 1. Arquitectura de Base de Datos y Aislamiento Multi-Tenant (SaaS)
La plataforma implementa un modelo de aislamiento de datos híbrido para garantizar el rendimiento y la seguridad del inquilino (Tenant):
*   **Base de Datos Centralizada:** Almacena la configuración de los tenants, usuarios, planes de suscripción, facturas de pago SaaS globales y registros de auditoría en una base de datos principal PostgreSQL.
*   **Aislamiento de Datos por Inquilino:** Cada cliente (tenant) cuenta con su propio espacio aislado a través de una base de datos SQLite dedicada (`db_path`), o mediante esquemas de base de datos PostgreSQL independientes controlados dinámicamente mediante un custom router de Django. Esto previene fugas de información accidental entre competidores.
*   **Criptografía y Cifrado Simétrico:** Los datos altamente sensibles del cliente (ej. llaves de pasarela de pago, credenciales API de facturación, direcciones físicas) son encriptados en reposo antes de almacenarse en la base de datos utilizando algoritmos simétricos avanzados (`cryptography.fernet`).

### 2. Backend (Django REST Framework)
Ubicado en el directorio `/backend`, es el núcleo de la lógica de negocios y procesamiento:
*   **Framework Principal**: Django (v5.2.x) y Django REST Framework (DRF) para APIs RESTful seguras, estructuradas y documentadas.
*   **Seguridad de Acceso**: Autenticación sin estado basada en JSON Web Tokens (JWT) con rotación automática mediante `djangorestframework-simplejwt`.
*   **Gestión de Permisos (RBAC)**: Modelo granular de roles que segmenta permisos entre `Super Administrador` (dueño de la plataforma SaaS), `Administrador` (propietario del negocio/tenant), `Employer` (administradores locales del negocio) y `Employee` (cajeros y vendedores con accesos restringidos al POS).
*   **Motor de Inteligencia Artificial**: Integración con las APIs de Google Gemini para procesamiento de lenguaje natural y consultoría empresarial integrada.

### 3. Frontend Principal (React + Electron + TypeScript)
Ubicado en el directorio `/frontend`, es la aplicación de interfaz de usuario de nivel empresarial:
*   **Entorno Híbrido Escritorio/Web**: Se compila como una aplicación nativa de escritorio frameless (sin barra de título predeterminada del sistema operativo) mediante **Electron**, ofreciendo una experiencia inmersiva fluida en entornos offline de punto de venta (POS). Paralelamente, se compila como aplicación web responsive con **Vite**.
*   **Aesthetics Premium**: Uso extensivo de Tailwind CSS, animaciones fluidas con **Framer Motion**, componentes modulares y modo oscuro/claro persistente en el sistema.
*   **UX Avanzada**: Arrastre y ordenamiento visual de catálogos y fotos con `@dnd-kit/core`, internacionalización (i18n) con `i18next`, y gráficos de negocio interactivos utilizando `Chart.js`.
*   **Reportabilidad**: Generación interactiva en el lado del cliente de documentos PDF (`jspdf`) y planillas Excel (`xlsx`).

### 4. Plataforma de Administración Global (`asenting-admin`)
Proyecto independiente ubicado en `/asenting-admin` diseñado exclusivamente para la supervisión del negocio SaaS:
*   Construido en React, Vite, Tailwind CSS y componentes basados en `shadcn/ui`.
*   Permite controlar las cuentas de clientes, estados de planes de pago, tickets de soporte y auditoría de accesos.
*   Incluye el centro de visualización de **Solicitudes de Creación de Sitios Web** para procesar los dominios de clientes y propuestas de diseño.

### 5. Portal Comercial (`asenting`)
Ubicado en el directorio `/asenting`, es la Landing Page comercial del software orientada a la venta del servicio SaaS:
*   Desarrollada con React y Vite bajo un enfoque moderno de conversión de leads.
*   Presenta los planes de suscripción, características, testimonios y pasarela de pago para registro y cobro inicial.

---

## 🖥️ Detalle de Páginas y Módulos del Panel de Control

### 1. 📊 Panel Principal / Dashboard (`Dashboard.tsx`)
*   **Función**: Centro de control visual al ingresar a la plataforma.
*   **Detalles**: Ofrece widgets dinámicos que resumen las ventas del día, el margen de ganancias, la cantidad de órdenes web pendientes y el estado de stock crítico. Incluye gráficos analíticos de desempeño de ventas semanales o mensuales.

### 2. 💰 Punto de Venta (POS) y Gestión de Caja
*   **Gestión de Ventas (`SalesPage.tsx`)**: Interfaz rápida adaptada a pantallas táctiles y teclado para registrar transacciones de mostrador. Permite buscar productos por nombre o código de barras, aplicar descuentos, seleccionar métodos de pago (efectivo, tarjetas, transferencias) y realizar la venta en segundos.
*   **Control de Caja (`CashboxPage.tsx`)**: Control estricto de dinero. Permite abrir y cerrar turnos de caja, registrar entradas y salidas de efectivo manuales y realizar arqueos de caja exactos para evitar discrepancias de caja.

### 3. 📦 Gestión de Inventario y Catálogos
*   **Gestión de Productos (`ProductosManager.tsx`, `ProductFormPage.tsx`)**: Lista completa y detallada de productos. El formulario de creación permite especificar nombre, SKU, código de barras, costo de compra, precio de venta, control de existencias mínimas de alerta, categorías y carga de imágenes.
*   **Variantes y Combinaciones**: Permite configurar múltiples variantes como colores, tallas o características especiales, asociando imágenes a colores específicos, control de SKUs generados de forma automática y overrides de precios por combinación de variante.
*   **Gestión de Categorías (`CategoriesManager.tsx`)**: Organización jerárquica de artículos, asignación de colores personalizados y ordenamiento visual por arrastrar y soltar.

### 4. 👥 Módulo de Clientes (CRM) y Proveedores (`ClientsPage.tsx`, `SuppliersPage.tsx`)
*   **Función**: Gestión y fidelización de clientes.
*   **Detalles**: Directorio completo con información de contacto, historial de compras detallado de cada cliente y control de saldos y créditos pendientes para negocios que venden bajo modalidad de cuentas corrientes ("fiado").
*   **Proveedores**: Gestión de contactos y control de pedidos de reabastecimiento (`PurchasesPage.tsx`).

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

### 7. 📑 Formulario de Solicitud de Página Web (`WebsiteRequestForm.tsx`)
*   **Función**: Asistente visual e interactivo de **4 pasos (Stepper)** para que el inquilino solicite el diseño y despliegue de su sitio web al Super Administrador:
    *   **Paso 1: Identidad**: Nombre del negocio, sector comercial y subdominio deseado (ej. *minegocio.asenting.com*).
    *   **Paso 2: Estructura**: Selección del tipo de sitio (Tienda Virtual con Carrito de Compras, Catálogo Digital para Pedidos por WhatsApp, o Página Corporativa Informativa) y selección múltiple de páginas/secciones (Inicio, Quiénes Somos, Contacto, etc.).
    *   **Paso 3: Estilo Visual**: Estilo estético (Minimalista, Elegante, Colorido, Rústico), definición de colores principales y estado del logotipo (subir existente, usar texto elegante o generar con IA).
    *   **Paso 4: Canales & Enlaces**: Métodos de cobro (Contra entrega, transferencia bancaria, pasarelas), enlaces de redes sociales (WhatsApp, Instagram, Facebook), páginas web de referencia e instrucciones adicionales.
*   **Tablero de Seguimiento**: Permite al cliente ver el estado del diseño (Pendiente, En Proceso, Completado), ver las propuestas del desarrollador, descargar archivos cargados y responder preguntas técnicas en tiempo real.

### 8. 📄 Gestión de Órdenes Web (`OrdersPage.tsx`)
*   **Función**: Tablero Kanban para rastrear y procesar compras entrantes de la tienda virtual.
*   **Detalles**: Permite cambiar el estado de las órdenes en tiempo real (Pendiente ➡️ Preparación ➡️ Enviado ➡️ Entregado) e informar automáticamente al cliente final.

### 9. 🤖 Asistente de Inteligencia Artificial (`AIChatAssistant.tsx`)
*   **Función**: Consultor de negocios basado en inteligencia artificial (Google Gemini).
*   **Detalles**: Interfaz de chat donde el comerciante puede preguntar dudas de negocio ("¿Cómo puedo mejorar mis ventas de ropa este mes?", "¿Qué productos tienen menor rotación?"), redactar copys de marketing para banners del sitio web o pedir ayuda en la configuración del panel.

### 10. 🔌 Integraciones Externas y Configuraciones (`ConfigPage.tsx`, `GoogleConfig.tsx`)
*   **Facturación DIAN (Alegra)**: Sincronización automática de inventario, ventas y facturación legal directamente con el sistema tributario colombiano (DIAN) vía API de Alegra (`ConfigAlegraPage.tsx`).
*   **Google Workspace**:
    *   **Google Drive**: Respaldos automatizados de base de datos e imágenes en la nube del cliente.
    *   **Google Gmail**: Alertas y envío automático de comprobantes de compra/venta a clientes finales.
    *   **Google OAuth**: Login rápido y seguro.
*   **Impresora Local**: Conexión con impresoras térmicas ESC/POS locales para facturas físicas.

---

## 🎨 Catálogo de Plantillas Web (`/templates` y `/Paginas`)

El constructor web genera de forma dinámica tiendas de alto impacto estético usando plantillas pre-diseñadas y optimizadas para conversión:

### Plantillas del Backend (`/backend/templates`)
Utilizadas para el renderizado dinámico en el servidor:
1.  **`blank-template`**: Plantilla limpia y optimizada para empezar diseños personalizados desde cero.
2.  **`plantilla`**: Estructura base estándar con catálogo modular de alto rendimiento.
3.  **`plantilla-alternativa`**: Diseño con barra de navegación lateral y enfoque en grandes descripciones de producto.
4.  **`plantilla-boutique`**: Orientada al sector moda y belleza, tipografía Serif elegante y zoom interactivo de producto.
5.  **`plantilla-brutalista`**: Diseño atrevido de alto contraste, enfocado a marcas juveniles y urbanas.
6.  **`plantilla-cyber`**: Diseñada para tiendas de tecnología, gaming y electrónica con temática oscura y acentos neón.

### Plantillas del Frontend (`/Paginas`)
Diseños interactivos de e-commerce autónomos:
1.  **`kooat`**: Tienda moderna, minimalista y ultra rápida enfocada en la claridad de los productos, excelente para e-commerce de indumentaria y calzado.
2.  **`burbuja`**: Plantilla divertida y colorida, ideal para reposterías, jugueterías, reposterías o tiendas de regalos.
3.  **`fress`**: Diseño optimizado para locales gastronómicos, restaurantes, cafés y entrega rápida a domicilio.

---

## ⚙️ Estructura del Repositorio

*   📁 `backend/`: Código fuente en Python con Django. Contiene la lógica multi-inquilino, servicios de IA, configuraciones de email, procesamiento de pasarelas de pago e integraciones tributarias.
*   📁 `frontend/`: Aplicación Electron + React + TS. Interfaz completa de POS, CRM, inventario, reportes, configuraciones y el asistente Onboarding.
*   📁 `asenting-admin/`: Panel de gestión global para super-administradores del SaaS (control de suscripciones, soporte y despliegue web).
*   📁 `asenting/`: Landing page comercial pública para captación e información de tarifas del software.
*   📁 `Paginas/`: Plantillas frontend web autónomas (kooat, burbuja, fress) autogenerables para los clientes.
*   📁 `_backend_publish/`: Espacio destinado para los paquetes listos de distribución o despliegues del servidor.

---
*Este documento se mantiene actualizado conforme evoluciona la arquitectura técnica del sistema Assent Dashboard.*
