# Guía de Deployment

## Backend (Docker)

### Construcción y ejecución local

```bash
# Construir la imagen
docker build -t laundry-backend .

# Ejecutar el contenedor
docker run -p 3001:3001 --env-file .env laundry-backend

# O usar docker-compose
docker-compose up -d
```

### Deploy en producción

1. **Opción 1: Docker Hub / Container Registry**
   ```bash
   # Tag de la imagen
   docker tag laundry-backend your-registry/laundry-backend:latest
   
   # Push a registry
   docker push your-registry/laundry-backend:latest
   ```

2. **Opción 2: Servidor VPS con Docker**
   - Subir el código
   - Ejecutar `docker-compose up -d`
   - Configurar reverse proxy (nginx) si es necesario

## Frontend (Netlify)

### Configuración en Netlify

1. **Conectar repositorio**
   - Ve a tu dashboard de Netlify
   - Conecta tu repositorio de GitHub/GitLab

2. **Configurar build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20

3. **Variables de entorno**
   - Agrega en Netlify Dashboard → Site settings → Environment variables:
     ```
     VITE_API_BASE_URL=https://your-backend-url.com
     ```

4. **Deploy automático**
   - Netlify detectará automáticamente el `netlify.toml`
   - Cada push a `main` desplegará automáticamente

### Deploy manual

```bash
# Build local
npm run build

# Deploy usando Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## Notas importantes

- **Backend**: Asegúrate de que el backend esté accesible públicamente para que el frontend pueda hacer peticiones
- **CORS**: El backend ya tiene CORS habilitado, pero verifica que esté configurado correctamente
- **Variables de entorno**: No subas el archivo `.env` al repositorio, usa `.env.example` como plantilla
- **SSL/HTTPS**: Netlify proporciona HTTPS automáticamente. Para el backend, considera usar un proxy reverso con SSL (nginx, Cloudflare, etc.)

## Estructura de URLs recomendada

- Frontend: `https://your-app.netlify.app`
- Backend: `https://api.your-app.com` (o `https://your-app.com/api`)

