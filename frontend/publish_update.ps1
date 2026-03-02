# Script para publicar actualización automáticamente
# Este script ya tiene tu token integrado.

# $env:GH_TOKEN="YOUR_TOKEN_HERE"

# Asegurar que estamos en el directorio correcto
Set-Location -Path $PSScriptRoot

Write-Host "Iniciando publicación de nueva versión..." -ForegroundColor Green
Write-Host "Asegúrate de haber subido el número de versión en package.json antes de ejecutar esto." -ForegroundColor Yellow

npm run publish:win

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Si ves un error sobre 'symbolic link' o 'privilegio requerido', por favor ejecuta este script como ADMINISTRADOR." -ForegroundColor Red
    Write-Host "Click derecho en PowerShell -> Ejecutar como administrador." -ForegroundColor Red
    Read-Host "Presiona Enter para salir..."
} else {
    Write-Host "¡Publicación exitosa! La actualización ya está en GitHub." -ForegroundColor Green
    Read-Host "Presiona Enter para salir..."
}
