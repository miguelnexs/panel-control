# Script para publicar versión automáticamente (Corregido para Admin y Dinámico)
# $env:GH_TOKEN="YOUR_TOKEN_HERE"

# Asegurar que estamos en el directorio correcto
Set-Location -Path $PSScriptRoot

# Leer versión del package.json para mostrar mensaje correcto
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$version = $packageJson.version

Write-Host "Iniciando publicación de versión $version..." -ForegroundColor Green
Write-Host "Se usará el directorio configurado en electron-builder-temp.yml (dist-electron-v9)" -ForegroundColor Yellow

# Intentar limpiar directorio de salida si existe para evitar problemas
# Pero si falla, seguimos igual (electron-builder intentará sobreescribir)
if (Test-Path "dist-electron-v9") {
    Write-Host "Limpiando directorio dist-electron-v9 anterior..." -ForegroundColor Cyan
    Remove-Item -Path "dist-electron-v9" -Recurse -Force -ErrorAction SilentlyContinue
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
Write-Host "Empaquetando y publicando versión $version..." -ForegroundColor Cyan
cmd /c "npx electron-builder --win --publish always -c electron-builder-temp.yml"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ha ocurrido un error durante el empaquetado/publicación." -ForegroundColor Red
    Write-Host "Verifica si hay archivos bloqueados o problemas de red." -ForegroundColor Red
} else {
    Write-Host "¡Publicación exitosa de la versión $version!" -ForegroundColor Green
    Write-Host "El instalador está en: dist-electron-v9" -ForegroundColor Green
    Write-Host "Las aplicaciones instaladas detectarán la actualización automáticamente." -ForegroundColor Green
}

Read-Host "Presiona Enter para salir..."
