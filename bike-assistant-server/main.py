# Server
from flask import Flask, request
import sqlite3
import json
import datetime

app = Flask(__name__)
conn = sqlite3.connect('first.db', check_same_thread=False)
# id autoincrement, username unique, password, email, join_date
c = conn.cursor()

def new_user(username, password, mail):
    try:
        c.execute("INSERT INTO USERS(username,password,mail,join_date) \
    VALUES(?, ? ,?, ?)", (username, password, mail, str(datetime.date.today())))
    except sqlite3.Error:
        return False
    c.execute("commit")
    return True

@app.route('/api/list')
def list_users():
    user_list=[]
    for row in c.execute("select username from USERS"):
        #print(row[0])
        user_list.append(row[0])
    return json.dumps({'users':user_list})

"""
@app.route('/api/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        mail = request.form['mail']
        print(username,password,mail)
        if new_user(username, password, mail) is True:
            return json.dumps({'RESPONSE': 'SUCCESS'})
        else:
            return json.dumps({'RESPONSE': 'FAILED'})
    print("")
"""


@app.route('/api/register', methods=['POST'])
def register():
    if request.is_json:
        content = request.get_json()
        print(content)
        username = content['username']
        password = content['password']
        mail = content['mail']
        print(username, password, mail)
        if new_user(username, password, mail) is True:
            return json.dumps({'RESPONSE': 'SUCCESS'})
        else:
            return json.dumps({'RESPONSE': 'FAILED'})
    return json.dumps({'RESPONSE': 'THIS IS NOT JSON'})


if __name__ == "__main__":
    app.run(ssl_context=('cert/cert.pem', 'cert/key.pem'))

