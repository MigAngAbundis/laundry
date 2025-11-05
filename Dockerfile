# Dockerfile para el backend Express
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para tsx)
RUN npm ci

# Copiar código del servidor y configuración
COPY server/ ./server/
COPY tsconfig.json ./

# Exponer puerto
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Comando para ejecutar el servidor con tsx
CMD ["npm", "run", "server"]

