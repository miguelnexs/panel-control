# Script para publicar versión automáticamente
# $env:GH_TOKEN se carga automáticamente desde .env si existe, o debe estar en variables de entorno

# Asegurar que estamos en el directorio correcto
Set-Location -Path $PSScriptRoot

# Leer versión del package.json para mostrar mensaje correcto
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$version = $packageJson.version

Write-Host "Iniciando publicación de versión $version..." -ForegroundColor Green
Write-Host "Se usará el directorio configurado en electron-builder.yml (o override)" -ForegroundColor Yellow

# Intentar cargar token desde .env si no existe en entorno
if (-not $env:GH_TOKEN) {
    if (Test-Path ".env") {
        $envContent = Get-Content ".env"
        foreach ($line in $envContent) {
            if ($line -match "^GH_TOKEN=(.*)$") {
                $env:GH_TOKEN = $matches[1]
                Write-Host "Token cargado desde .env" -ForegroundColor Cyan
                break
            }
        }
    }
}

if (-not $env:GH_TOKEN) {
    Write-Host "ADVERTENCIA: GH_TOKEN no encontrado en variables de entorno ni en .env" -ForegroundColor Red
    Write-Host "La publicación podría fallar si es un repositorio privado." -ForegroundColor Yellow
}

# Ejecutar compilación (npm run build)
Write-Host "Compilando código fuente..." -ForegroundColor Cyan
cmd /c "npm run build"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en la compilación. Abortando." -ForegroundColor Red
    Read-Host "Presiona Enter para salir..."
    exit
}

# Ejecutar empaquetado y publicación (npx electron-builder)
# Usamos electron-builder.yml por defecto, o temporal si existe
$configFile = "electron-builder.yml"
if (Test-Path "electron-builder-temp.yml") {
    $configFile = "electron-builder-temp.yml"
    Write-Host "Usando configuración temporal: $configFile" -ForegroundColor Yellow
}

Write-Host "Empaquetando y publicando versión $version..." -ForegroundColor Cyan
cmd /c "npx electron-builder --win --publish always -c $configFile"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ha ocurrido un error durante el empaquetado/publicación." -ForegroundColor Red
    Write-Host "Verifica si hay archivos bloqueados o problemas de red." -ForegroundColor Red
    Write-Host "INTENTO DE SOLUCIÓN: Ejecuta este script como Administrador si ves errores de permisos/symlinks." -ForegroundColor Yellow
} else {
    Write-Host "¡Publicación exitosa de la versión $version!" -ForegroundColor Green
    Write-Host "Las aplicaciones instaladas detectarán la actualización automáticamente." -ForegroundColor Green
}

Read-Host "Presiona Enter para salir..."
