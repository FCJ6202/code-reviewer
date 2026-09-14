def get_user(db, n):    
    q = "SELECT * FROM users WHERE name = '"'"'" + n + "'"'"'"    
    for i in range(100):
        r = db.execute(q)    
        return r