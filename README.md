# Sistema de Gestión de Tickets de Lavandería

Aplicación full-stack para la gestión de tickets de lavandería, desarrollada con React, TypeScript, Redux Toolkit y Express.

## 📋 Características

- ✅ Gestión completa de tickets (CRUD)
- ✅ Autenticación con JWT y persistencia de sesión
- ✅ Visualización de usuarios desde API externa (dummyjson.com)
- ✅ Visualizador de PDFs integrado
- ✅ Validación de formularios con react-hook-form
- ✅ Interfaz moderna con PrimeReact
- ✅ Tests unitarios con Vitest

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20 o superior
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd test2

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (frontend)
npm run dev

# En otra terminal, iniciar servidor backend
npm run dev:server
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 📦 Dependencias

### Dependencias de Producción

#### Frontend

- **react** (^18.2.0) - Biblioteca principal para construir la interfaz de usuario
- **react-dom** (^18.2.0) - Renderizado de React en el DOM
- **react-router-dom** (^7.9.5) - Enrutamiento y navegación en la aplicación SPA
- **@reduxjs/toolkit** (^2.10.1) - Gestión de estado global de la aplicación
- **react-redux** (^9.2.0) - Conexión entre React y Redux
- **react-hook-form** (^7.66.0) - Manejo y validación de formularios
- **primereact** (^10.9.7) - Biblioteca de componentes UI (tablas, formularios, modales, etc.)
- **primeicons** (^7.0.0) - Iconos para componentes de PrimeReact
- **primeflex** (^4.0.0) - Sistema de utilidades CSS (similar a Tailwind)
- **react-pdf** (^10.2.0) - Visualización de documentos PDF en el navegador

#### Backend

- **express** (^5.1.0) - Framework web para Node.js, maneja las rutas y middleware
- **cors** (^2.8.5) - Middleware para habilitar CORS (permite requests desde el frontend)
- **dotenv** (^17.2.3) - Carga variables de entorno desde archivo .env

### Dependencias de Desarrollo

- **typescript** (^5.0.0) - Superset de JavaScript con tipos estáticos
- **vite** (^5.0.0) - Build tool y dev server, más rápido que webpack
- **@vitejs/plugin-react** (^4.2.0) - Plugin de Vite para soporte de React
- **tsx** (^4.20.6) - Ejecuta TypeScript directamente sin compilar
- **vitest** (^4.0.7) - Framework de testing (similar a Jest pero más rápido)
- **@testing-library/react** (^16.3.0) - Utilidades para testing de componentes React
- **@testing-library/jest-dom** (^6.9.1) - Matchers adicionales para DOM testing
- **jsdom** (^27.1.0) - Implementación de DOM para testing en Node.js
- **@types/react** (^18.2.0) - Tipos TypeScript para React
- **@types/react-dom** (^18.2.0) - Tipos TypeScript para react-dom
- **@types/express** (^5.0.5) - Tipos TypeScript para Express
- **@types/cors** (^2.8.19) - Tipos TypeScript para CORS

## 🏗️ Estructura del Proyecto

```
test2/
├── src/                    # Código fuente del frontend
│   ├── app/               # Configuración de Redux store
│   ├── components/        # Componentes reutilizables
│   ├── features/          # Features organizados por dominio
│   │   ├── auth/         # Autenticación y login
│   │   ├── posts/        # Gestión de tickets
│   │   ├── users/        # Gestión de usuarios
│   │   └── docs/         # Visualizador de PDFs
│   ├── config/           # Configuración (API, etc.)
│   └── utils/            # Utilidades y helpers
├── server/                # Backend Express
│   ├── routes/           # Rutas de la API
│   └── types.ts          # Tipos compartidos
├── public/              # Archivos estáticos
└── package.json          # Dependencias y scripts
```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo del frontend (Vite)
- `npm run build` - Construye la aplicación para producción
- `npm run test` - Ejecuta los tests con Vitest
- `npm run dev:server` - Inicia el servidor backend en modo desarrollo (watch)
- `npm run server` - Inicia el servidor backend en modo producción
- `npm run preview` - Previsualiza el build de producción

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm test -- --watch

# Ejecutar tests con cobertura
npm test -- --coverage
```

## 🔐 Autenticación

Las credenciales por defecto para desarrollo son:
- Usuario: `kminchelle`
- Contraseña: `admin123`

## 📡 API Endpoints

### Autenticación
- `GET /auth/me` - Obtener perfil del usuario actual

### Tickets
- `GET /posts?limit=10&skip=0` - Listar tickets
- `GET /posts/search?q=<texto>` - Buscar tickets
- `POST /posts/add` - Crear nuevo ticket
- `PUT /posts/:id` - Actualizar ticket
- `DELETE /posts/:id` - Eliminar ticket

### Usuarios
- `GET /users?limit=100` - Listar usuarios (desde dummyjson.com)

## 🐳 Docker

Ver [README.deployment.md](./README.deployment.md) para instrucciones de deployment con Docker y Netlify.

## 📄 Licencia

Este proyecto es privado.

