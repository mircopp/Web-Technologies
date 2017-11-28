from flask import Flask, request, json, make_response, jsonify
from flask_cors import CORS
import json
from dotenv import load_dotenv, find_dotenv

import bson.json_util as bson
from os import environ as env

from database import DatabaseClient
from authorization import requires_auth, AuthError
import constants

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

AUTH0_DOMAIN = env.get(constants.AUTH0_DOMAIN)
AUTH0_AUDIENCE = env.get(constants.API_ID)
PORT = env.get(constants.PORT)

app = Flask(__name__)
CORS(app)

@app.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response

unicorn_db = DatabaseClient('unicornDatabase')


@app.route('/', methods=['GET', 'POST'])
def hello_world():
    response = make_response(json.dumps({'status' : False}))
    response.headers['Content-Type'] = 'application/json'
    return response


@app.route('/unicorns', methods=['GET', 'POST'])
@requires_auth
def unicorn_service():
    data = unicorn_db.get_data_from_collection('unicorns')
    for sgl_datapoint in data:
        del sgl_datapoint['_id']
    response = make_response(json.dumps(data))
    response.headers['Content-Type'] = 'application/json'
    return response

@app.route('/unicornsBSON', methods=['GET', 'POST'])
@requires_auth
def unicorn_service_bson():
    data = unicorn_db.get_data_from_collection('unicorns')
    response = make_response(bson.dumps(data))
    response.headers['Content-Type'] = 'application/json'
    return response



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=False, threaded=True)
