from flask import Flask, jsonify, request, send_from_directory
import json
import os
from flask_cors import CORS
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

def save_data(data):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@socketio.on('message')
def handle_message(data):
    print(f"Received message: {data}")
    send(data, broadcast=True)

@app.route('/')
def serve_admin():
    return send_from_directory('../admin', 'index.html')

@app.route('/api/products', methods=['GET'])
def get_products():
    data = load_data()
    category = request.args.get('category')
    products = data['products']
    if category:
        products = [p for p in products if category in p['categories']]
    return jsonify(products)

@app.route('/api/products', methods=['POST'])
def add_product():
    data = load_data()
    new_product = request.json
    new_product['id'] = len(data['products']) + 1
    data['products'].append(new_product)
    save_data(data)
    return jsonify(new_product), 201

@app.route('/api/products/<int:id>', methods=['PUT'])
def update_product(id):
    data = load_data()
    product = next((p for p in data['products'] if p['id'] == id), None)
    if not product:
        return jsonify({'error': 'Товар не найден'}), 404
    update_data = request.json
    product.update(update_data)
    save_data(data)
    return jsonify(product)

@app.route('/api/products/<int:id>', methods=['GET'])
def get_product(id):
    data = load_data()
    product = next((p for p in data['products'] if p['id'] == id), None)
    if product:
        return jsonify(product)
    else:
        return jsonify({'error': 'Товар не найден'}), 404

@app.route('/api/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    data = load_data()
    data['products'] = [p for p in data['products'] if p['id'] != id]
    save_data(data)
    return jsonify({'message': 'Товар удален'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
