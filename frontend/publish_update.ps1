# Script de publicacion simplificado
Set-Location -Path $PSScriptRoot
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$version = $packageJson.version
Write-Host "Version: $version"

if (-not $env:GH_TOKEN) {
    if (Test-Path ".env") {
        $envContent = Get-Content ".env"
        foreach ($line in $envContent) {
            if ($line -match "^GH_TOKEN=(.*)$") {
                $env:GH_TOKEN = $matches[1].Trim()
                break
            }
        }
    }
}

cmd /c "npm run build"
if ($LASTEXITCODE -eq 0) {
    $configFile = "electron-builder.yml"
    if (Test-Path "electron-builder-temp.yml") {
        $configFile = "electron-builder-temp.yml"
    }
    cmd /c "npx electron-builder --win --publish always -c $configFile"
}
