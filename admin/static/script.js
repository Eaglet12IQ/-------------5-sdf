const API_URL = 'http://localhost:3000/api/products';

document.addEventListener('DOMContentLoaded', loadProducts);

document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const product = {
        name: document.getElementById('name').value,
        price: parseFloat(document.getElementById('price').value),
        description: document.getElementById('description').value,
        categories: document.getElementById('categories').value.split(',').map(c => c.trim())
    };
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
    loadProducts();
    e.target.reset();
});

document.getElementById('editProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const product = {
        id: parseInt(document.getElementById('editId').value),
        name: document.getElementById('editName').value,
        price: parseFloat(document.getElementById('editPrice').value),
        description: document.getElementById('editDescription').value,
        categories: document.getElementById('editCategories').value.split(',').map(c => c.trim())
    };
    await fetch(`${API_URL}/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
    loadProducts();
    document.getElementById('editProductForm').style.display = 'none';
    document.getElementById('addProductForm').style.display = 'block';
    e.target.reset();
});

document.getElementById('cancelEdit').addEventListener('click', () => {
    document.getElementById('editProductForm').style.display = 'none';
    document.getElementById('addProductForm').style.display = 'block';
});

async function deleteProduct(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadProducts();
}

async function loadProducts() {
    const response = await fetch(API_URL);
    const products = await response.json();
    const tbody = document.getElementById('productsTable').querySelector('tbody');
    tbody.innerHTML = '';
    products.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.price}</td>
            <td>${p.description}</td>
            <td>${p.categories.join(', ')}</td>
            <td>
                <button onclick="editProduct(${p.id})">Редактировать</button>
                <button onclick="deleteProduct(${p.id})">Удалить</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function editProduct(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const product = await response.json();
    document.getElementById('editId').value = product.id;
    document.getElementById('editName').value = product.name;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editDescription').value = product.description;
    document.getElementById('editCategories').value = product.categories.join(', ');
    document.getElementById('editProductForm').style.display = 'block';
    document.getElementById('addProductForm').style.display = 'none';
}

const socket = io.connect('http://localhost:5000');

socket.on('message', function(data) {
    addMessage(data.data);
});

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = "Admin: " + input.value.trim();
    
    if(message) {
        socket.emit('message', {data: message});
        input.value = '';
    }
}

function addMessage(message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById('message-input').addEventListener('keypress', function(e) {
    if(e.key === 'Enter') {
        sendMessage();
    }
});