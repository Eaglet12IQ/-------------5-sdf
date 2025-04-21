from flask import Flask, jsonify, request, send_from_directory
import json
import os
from flask_cors import CORS
from flask_graphql import GraphQLView
from schema import schema
from flask_socketio import SocketIO, send

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database.json')

def load_data():
    if not os.path.exists(DB_FILE):
        default_data = {"products": []}
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(default_data, f, ensure_ascii=False, indent=2)
        return default_data

    with open(DB_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {"products": []}
        
app.add_url_rule('/graphql', view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True))

@socketio.on('message')
def handle_message(data):
    print(f"Received message: {data}")
    send(data, broadcast=True)
    
@app.route('/')
def serve_admin():
    return send_from_directory('../client', 'index.html')

@app.route('/api/products', methods=['GET'])
def get_products():
    data = load_data()
    category = request.args.get('category')
    products = data['products']
    if category:
        products = [p for p in products if category in p['categories']]
    return jsonify(products)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
