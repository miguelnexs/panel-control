# Script de publicacion simplificado
Set-Location -Path $PSScriptRoot
$ErrorActionPreference = "Stop"
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$version = $packageJson.version
Write-Host "Version: $version"

if (-not $env:GH_TOKEN) { throw "GH_TOKEN no esta definido en el entorno. Define GH_TOKEN como variable de entorno (no se leera desde .env)." }

npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$configFile = "electron-builder.yml"
if (Test-Path "electron-builder-temp.yml") {
    $configFile = "electron-builder-temp.yml"
}

npx electron-builder --win --publish always -c $configFile
