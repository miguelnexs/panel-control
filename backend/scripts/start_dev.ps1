$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path "$here\.."
Set-Location $root
$python = 'D:\Datos.computador-miguel\scoop\apps\python\3.13.7\python.exe'
if (!(Test-Path '.venv')) {
  if (Test-Path $python) {
    & $python -m venv .venv
  } else {
    & python -m venv .venv
  }
}
& ".venv\Scripts\python.exe" -m pip install -r requirements.txt
& ".venv\Scripts\python.exe" manage.py runserver 0.0.0.0:8000
