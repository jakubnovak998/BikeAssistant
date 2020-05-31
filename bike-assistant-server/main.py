# Server
from flask import Flask, request
import sqlite3
import json
import datetime
import secrets
import numpy as np
import re

app = Flask(__name__)
conn = sqlite3.connect('first.db', check_same_thread=False)
# id autoincrement, username unique, password, email, join_date


def new_user(username, password, mail):
    if re.match('^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', mail) is None:
        return False
    if len(username) < 3 or len(password) < 3:
        return False
    c = conn.cursor()
    try:
        c.execute("INSERT INTO USERS(username,password,mail,join_date) \
    VALUES(?, ? ,?, ?)", (username, password, mail, str(datetime.date.today())))
    except sqlite3.Error:
        return False
    conn.commit()
    c.close()
    return True


def login_user(username, password):
    user_list = []
    c = conn.cursor()
    for row in c.execute("select username from USERS"):
        user_list.append(row[0])
    if username in user_list:
        c.execute('select password from USERS where username= ?;', (username,))
        passwords_db = c.fetchone()[0]
        c.close()
        if password == passwords_db:
            return True
        return False


def gen_api_key(username):
    c = conn.cursor()
    c.execute("select user_id from users where username= ?", (username,))
    user_id = c.fetchone()[0]
    c.execute("DELETE FROM API_KEYS WHERE user_id= ?", (user_id,))
    api = secrets.token_hex(16)
    c.execute("INSERT INTO API_KEYS(user_id,api_key) VALUES(?, ?)", (user_id, api))
    conn.commit()
    c.close()
    return api


def check_api_key(user_key):
    user_id = []
    c = conn.cursor()
    for row in c.execute("select api_key from api_keys"):
        user_id.append(row[0])
    c.close()
    if user_key in user_id:
        return True
    else:
        return False


def get_user_id(user_key):
    c = conn.cursor()
    c.execute("select u.user_id from users u join api_keys k on k.user_id=u.user_id "
              "where api_key ='" + user_key + "';")
    user_id = (c.fetchone())
    if user_id is None:
        return -1
    return user_id[0]


@app.route('/api/list', methods=['POST'])
def list_users():
    if request.is_json:
        c = conn.cursor()
        user_list = []
        content = request.get_json()
        if check_api_key(content['API_KEY']) is True:
            for row in c.execute("select username from USERS"):
                user_list.append(row[0])
            c.close()
            return json.dumps({'users': user_list})
        return json.dumps({'STATUS': 'ERROR. API KEY NOT VALID'})
    return json.dumps({'RESPONSE': 'THIS IS NOT JSON'})


@app.route('/api/register', methods=['POST'])
def register():
    if request.is_json:
        content = request.get_json()
        username = content['username']
        password = content['password']
        mail = content['mail'].lower()
        if new_user(username, password, mail) is True:
            return json.dumps({'RESPONSE': 'SUCCESS'})
        else:
            return json.dumps({'RESPONSE': 'FAILED'})
    else:
        return json.dumps({'RESPONSE': 'THIS IS NOT JSON'})


@app.route('/api/login', methods=['GET', 'POST'])
def login():
    if request.is_json:
        content = request.get_json()
        username = content['username']
        password = content['password']
        if login_user(username, password) is True:
            return json.dumps({'RESPONSE': 'SUCCESS', 'API_KEY': gen_api_key(username)})
        else:
            return json.dumps({'RESPONSE': 'FAILED'})
    else:
        return json.dumps({'RESPONSE': 'THIS IS NOT JSON'})


@app.route('/api/saveTrace', methods=['GET', 'POST'])
def save_tracking_data():
    if request.is_json:
        content = request.get_json()
        user_key = content['API_KEY']
        trace = content['TRACE']
        date = content['DATE']
        duration = content['DURATION']
        distance = content['DISTANCE']
        user_id = get_user_id(user_key)
        if user_id == -1:
            return json.dumps({'RESPONSE': 'USER KEY NOT VALID'})
        c = conn.cursor()
        c.execute("INSERT INTO trace_users(user_id,date,duration,distance) \
            VALUES(?, ? ,?,?)", (user_id, date, duration, distance))
        conn.commit()
        c.execute("select last_insert_rowid();")
        trace_id = c.fetchone()[0]
        for i in range(0, len(trace)):
            c.execute("INSERT INTO trace(trace_id,idx,lat,lng) \
                        VALUES(?, ? ,?,?)",
                      (trace_id, i + 1, trace[i]['lat'], trace[i]['lng']))
        conn.commit()
        c.close()
        return json.dumps({'RESPONSE': 'SUCCESS'})
    else:
        return json.dumps({'RESPONSE': 'THIS IS NOT JSON'})


@app.route('/api/plan', methods=['GET', 'POST'])
def plan():
        if request.is_json:
            c = conn.cursor()
            content = request.get_json()
            goal = content['goal']
            user_key = content['API_KEY']
            beginDate = content['beginDate']
            endDate = content['endDate']
            ridden = 0
            user_id = get_user_id(user_key)
            realised = 0
            for dist in c.execute("select distance from trace_users where user_id = " + str(user_id)):
                ridden += float(dist[0])

            ridden = int(ridden)
            if user_id == -1:
                c.close()
                return json.dumps({'RESPONSE': 'USER KEY NOT VALID'})
            c.execute("INSERT INTO plans(user_id, beginDate, endDate, goal, ridden, realised) \
                        VALUES(?, ? , ?, ?, ?, ?)", (user_id, beginDate, endDate, goal, ridden, realised))
            conn.commit()
            c.close()
            return json.dumps({'RESPONSE': 'SUCCESS'})


@app.route('/api/plans/<api_key>', methods=['GET'])
def getPlans(api_key):
        if request.is_json:
            user_id = get_user_id(api_key)
            plans = []
            today = datetime.date.today()
            riddenNow = 0
            c = conn.cursor()
            d = conn.cursor()
            for dist in c.execute("select distance from trace_users where user_id = " + str(user_id)):
                riddenNow += float(dist[0])
            riddenNow = int(riddenNow)

            for plan in c.execute("select * from PLANS where user_id = " + str(user_id)):
                planArray = np.array([*plan])
                ridden = float(planArray[5])
                goal = float(planArray[4])
                endDate = datetime.datetime.strptime(planArray[3], '%Y-%m-%d').date()
                if riddenNow > ridden:
                    d.execute("UPDATE PLANS SET ridden= " + str(riddenNow) + " WHERE plan_id = " + planArray[0])
                    conn.commit()
                if riddenNow - ridden >= goal:
                    planArray[6] = 1
                    d.execute("UPDATE PLANS SET realised=1 WHERE plan_id = " + planArray[0])
                    conn.commit()
                else:
                    if today >= endDate:
                        d.execute("DELETE FROM PLANS WHERE plan_id = " + planArray[0])
                        conn.commit()
                        continue

                plans.append({'beginDate': planArray[2], 'endDate': planArray[3],
                              'goal': planArray[4], 'ridden': riddenNow, 'realised': planArray[6]})
            c.close()
            return json.dumps({'RESPONSE': 'SUCCESS', 'plans': plans})


@app.route('/api/getHistory', methods=['GET', 'POST'])
def get_tracking_data():
    if request.is_json:
        content = request.get_json()
        user_key = content['API_KEY']
        user_id = get_user_id(user_key)
        if user_id == -1:
            return json.dumps({'RESPONSE': 'USER KEY NOT VALID'})
        history = []
        temp = []
        c = conn.cursor()
        d = conn.cursor()
        for row in c.execute("select * from trace_users where user_id = " + str(user_id)):
            temp.append(row)
            history.append({'DATE': temp[-1][2], 'DURATION': temp[-1][3], 'DISTANCE': temp[-1][4], 'TRACE': temp[-1][0]})
            trace_id = history[-1]['TRACE']
            temp = []
            trace = []
            for row2 in d.execute("select lat,lng from trace where trace_id = " + str(trace_id) + " order by idx"):
                temp.append(row2)
                trace.append({'lat': temp[-1][0], 'lng': temp[-1][1]})
            history[-1]['TRACE'] = trace
        c.close()
        d.close()
        return json.dumps({'RESPONSE': 'SUCCESS', 'DATA': history})
    else:
        return json.dumps({'RESPONSE': 'THIS IS NOT JSON'})


if __name__ == "__main__":
    app.run(host='0.0.0.0', ssl_context=('cert/cert.pem', 'cert/key.pem'))