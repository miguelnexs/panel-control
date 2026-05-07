import psycopg2
try:
    conn = psycopg2.connect(
        dbname='postgres',
        user='localix',
        password='localix_password',
        host='127.0.0.1',
        port='5432'
    )
    print("Connected!")
    conn.close()
except Exception as e:
    import traceback
    print("Error class:", e.__class__.__name__)
    try:
        # Try to get the message as bytes if possible
        msg = str(e).encode('utf-8', errors='replace')
        print("Error message (utf-8 replace):", msg.decode('utf-8'))
    except:
        print("Error:", e)
