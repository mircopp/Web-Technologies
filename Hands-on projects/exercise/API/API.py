from flask import Flask, make_response, json
from flask_cors import CORS


import bson.json_util as bson
from database import DatabaseClient
from authorization import requires_auth, AuthError

app = Flask(__name__)
CORS(app)

unicorn_db = DatabaseClient('unicornDatabase')

@app.errorhandler(AuthError)
def handle_auth_error(ex):
    response = make_response(json.dumps(ex.error))
    response.status_code = ex.status_code
    return response

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/unicorns', methods=['GET', 'POST'])
@requires_auth
def unicorn_service():
    data = unicorn_db.get_data_from_collection('unicorns')
    response = make_response(bson.dumps(data))
    response.headers['Content-Type'] = 'application/json'
    return response


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, threaded=True)
