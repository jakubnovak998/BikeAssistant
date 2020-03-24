# Server
from flask import Flask, request
import sqlite3
import json
import datetime
import secrets

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


def login_user(username,password):
    user_list = []
    for row in c.execute("select username from USERS"):
        user_list.append(row[0])
    if username in user_list:
        c.execute('select password from USERS where username= ?;', (username,))
        passwords_db = c.fetchone()[0]
        print(passwords_db)
        if password == passwords_db:
            return True
        return False


def gen_api_key(username):
    c.execute("select user_id from users where username= ?", (username,))
    user_id = c.fetchone()[0]
    print(user_id)
    c.execute("DELETE FROM API_KEYS WHERE user_id= ?", (user_id,))
    api = secrets.token_hex(16)
    c.execute("INSERT INTO API_KEYS(user_id,api_key) VALUES(?, ?)", (user_id, api))
    c.execute('commit')
    return api


def check_api_key(user_key):
    user_id = []
    for row in c.execute("select api_key from api_keys"):
        user_id.append(row[0])
    print(user_id)
    if user_key in user_id:
        return True
    else:
        return False


@app.route('/api/list', methods=['POST'])
def list_users():
    if request.is_json:
        user_list = []
        content = request.get_json()
        if check_api_key(content['API_KEY']) is True:
            for row in c.execute("select username from USERS"):
                #print(row[0])
                user_list.append(row[0])
            return json.dumps({'users':user_list})
        return json.dumps({'STATUS': 'ERROR. API KEY NOT VALID'})
    return json.dumps({'RESPONSE': 'THIS IS NOT JSON'})

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


@app.route('/api/login', methods=['GET', 'POST'])
def login():
    if request.is_json:
        content = request.get_json()
        print(content)
        username = content['username']
        password = content['password']
        print(username, password)
        if login_user(username, password) is True:
            return json.dumps({'RESPONSE': 'SUCCESS', 'API_KEY': gen_api_key(username)})
        else:
            return json.dumps({'RESPONSE': 'FAILED'})
    return json.dumps({'RESPONSE': 'THIS IS NOT JSON'})


if __name__ == "__main__":
    app.run(ssl_context=('cert/cert.pem', 'cert/key.pem'))

