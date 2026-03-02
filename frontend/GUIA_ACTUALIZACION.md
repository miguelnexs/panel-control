# Guía de Actualización Automática

Para que la aplicación se actualice automáticamente, debes seguir estos pasos CADA VEZ que quieras lanzar una nueva versión.

## 1. Requisito Único: GitHub Token
Necesitas un token personal de GitHub para subir los archivos de la actualización.
1. Ve a GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic).
2. Genera uno nuevo ("Generate new token").
3. Dale permisos de **`repo`** (Full control of private repositories).
4. Copia el token (empieza por `ghp_...`).

## 2. Pasos para Actualizar

1. **Subir versión**: Abre `package.json` y aumenta la versión (ej. de `1.0.4` a `1.0.5`).

2. **Publicar**:
   Abre una terminal en `panel-control/frontend` y ejecuta:

   **PowerShell:**
   ```powershell
   $env:GH_TOKEN="tu_token_aqui_pegado"
   npm run publish:win
   ```

   **CMD:**
   ```cmd
   set GH_TOKEN=tu_token_aqui_pegado
   npm run publish:win
   ```

3. **Listo**: Esto creará una nueva "Release" en GitHub. La aplicación instalada detectará la nueva versión automáticamente al abrirse y se actualizará.

## Nota sobre Repositorio Privado
Si tu repositorio es **Privado**, necesitas configurar el token también dentro de la aplicación o usar variables de entorno en las máquinas de los clientes, lo cual es complicado. Lo ideal para distribución sencilla es que el repositorio sea **Público**.
