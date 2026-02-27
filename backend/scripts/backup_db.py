import os
import sys
import datetime
import subprocess
from pathlib import Path

# Add project root to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Load Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "globetrek_backend.settings")
import django
django.setup()

from django.conf import settings

def backup_database():
    db_settings = settings.DATABASES['default']
    
    # Check if it's PostgreSQL
    if 'postgresql' not in db_settings['ENGINE']:
        print("This script is designed for PostgreSQL. Please adjust for your database engine.")
        return

    db_name = db_settings['NAME']
    db_user = db_settings['USER']
    db_password = db_settings['PASSWORD']
    db_host = db_settings['HOST']
    db_port = db_settings['PORT']

    timestamp = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    backup_dir = BASE_DIR / 'backups'
    os.makedirs(backup_dir, exist_ok=True)
    
    backup_file = backup_dir / f"{db_name}_backup_{timestamp}.sql"

    # Construct pg_dump command
    # Assuming pg_dump is in PATH. If not, you might need to specify full path.
    # We use PGPASSWORD env var to avoid password prompt
    env = os.environ.copy()
    if db_password:
        env['PGPASSWORD'] = db_password

    cmd = [
        'pg_dump',
        '-h', db_host,
        '-p', db_port,
        '-U', db_user,
        '-F', 'c', # Custom format (compressed)
        '-b', # Include blobs
        '-v', # Verbose
        '-f', str(backup_file),
        db_name
    ]

    print(f"Starting backup of {db_name} to {backup_file}...")
    
    try:
        subprocess.run(cmd, env=env, check=True)
        print("Backup completed successfully.")
        
        # Cleanup old backups (keep last 7 days)
        cleanup_old_backups(backup_dir)
        
    except subprocess.CalledProcessError as e:
        print(f"Error during backup: {e}")
    except FileNotFoundError:
        print("pg_dump not found. Please ensure PostgreSQL tools are installed and in PATH.")

def cleanup_old_backups(backup_dir, days=7):
    print(f"Cleaning up backups older than {days} days...")
    cutoff_date = datetime.datetime.now() - datetime.timedelta(days=days)
    
    for backup in backup_dir.glob('*.sql'):
        if datetime.datetime.fromtimestamp(backup.stat().st_mtime) < cutoff_date:
            print(f"Deleting old backup: {backup.name}")
            os.remove(backup)

if __name__ == "__main__":
    backup_database()
