# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for web
RUN npm run build:web

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
# Note: vite.config.web.ts configures outDir to dist-web in project root
COPY --from=build /app/dist-web /usr/share/nginx/html

# Copy nginx configuration if needed (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
