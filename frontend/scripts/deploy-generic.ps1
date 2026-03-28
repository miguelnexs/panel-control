Param()
$ErrorActionPreference = "Stop"
$distDir = Join-Path $PSScriptRoot "..\dist-electron-v7\nsis-web"
if (!(Test-Path $distDir)) {
  Write-Error "Directorio de artefactos no encontrado: $distDir"
  exit 1
}
$awsCmd = Get-Command aws -ErrorAction SilentlyContinue
if ($env:S3_BUCKET -and $awsCmd) {
  $prefix = $env:S3_PREFIX
  if (-not $prefix) { $prefix = "" }
  $dest = "s3://$($env:S3_BUCKET)/$prefix"
  $acl = $env:S3_ACL
  if (-not $acl) { $acl = "public-read" }
  aws s3 sync $distDir $dest --acl $acl
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } else { exit 0 }
}
if ($env:SFTP_HOST -and $env:SFTP_USER -and $env:SFTP_DEST) {
  $files = Get-ChildItem -File $distDir
  foreach ($f in $files) {
    scp -q -o StrictHostKeyChecking=no $f.FullName "$($env:SFTP_USER)@$($env:SFTP_HOST):$($env:SFTP_DEST)/"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  }
  exit 0
}
Write-Error "No hay método de subida configurado. Define S3_BUCKET (+ opcional S3_PREFIX,S3_ACL) o SFTP_HOST,SFTP_USER,SFTP_DEST."
exit 1
