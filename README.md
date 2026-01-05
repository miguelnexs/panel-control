# Asenting

Asenting is a comprehensive platform designed for managing digital businesses, featuring a powerful desktop application, a robust backend API, and a modern web interface.

## 🚀 Project Structure

The project is organized into three main components:

- **`frontend/`**: The Desktop Application built with **Electron** and **React**.
  - Handles administrative tasks: Product management, User control, Sales tracking, and Template configuration.
  - Features a drag-and-drop interface for managing web templates.
  - Connects to the backend for real-time data synchronization.

- **`backend/`**: The Server-Side Application built with **Django** and **Django REST Framework**.
  - Provides API endpoints for the frontend and web components.
  - Manages the database (SQLite/PostgreSQL), authentication, and business logic.
  - **Template System**: Stores and serves web templates dynamically.
  - **Multi-tenancy**: Supports multiple users/tenants with isolated data.

- **`asenting/`**: The Web Interface / Landing Page built with **React** and **Vite**.
  - Public-facing website or dashboard for end-users.
  - Modern UI components using **shadcn-ui** and **Tailwind CSS**.

## 🛠️ Setup & Installation

### Backend (Django)

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Linux/Mac
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run migrations:
    ```bash
    python manage.py migrate
    ```
5.  Start the server:
    ```bash
    python manage.py runserver
    ```

### Frontend (Electron Desktop App)

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development app:
    ```bash
    npm run dev
    ```

### Web/Landing Page

1.  Navigate to the asenting directory:
    ```bash
    cd asenting
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## ✨ Key Features

-   **Template Management**: Upload, preview, and manage HTML/React templates directly from the desktop app. Backend-served demos ensure portability.
-   **E-commerce Ready**: Complete product, category, and inventory management.
-   **Sales Dashboard**: Real-time visualization of sales, orders, and customer metrics.
-   **User & Access Control**: Role-based authentication and user management.

## 📝 Recent Updates

-   **Backend Template Storage**: Templates are now stored and served from the backend `templates/` directory, removing hardcoded local paths and improving deployment flexibility.
-   **Dynamic Demos**: The desktop app automatically detects and links to available demos for templates.
