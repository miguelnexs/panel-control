import psycopg2
try:
    conn = psycopg2.connect(
        dbname='postgres',
        user='localix',
        password='localix_password',
        host='127.0.0.1',
        port='5432'
    )
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT datname FROM pg_database;")
    dbs = cur.fetchall()
    print("Databases:", [db[0] for db in dbs])
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
