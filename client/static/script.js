const GraphQL_URL = 'http://localhost:8080/graphql';
let products = [];

async function fetchProducts() {
    const query = `
        query {
            products {
                name
                price
                description
                categories
            }
        }
    `;

    const response = await fetch(GraphQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });

    const result = await response.json();
    products = result.data.products;
    return products;
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchProducts();
    displayProducts(products);
});

function displayProducts(productsToDisplay) {
    const productsContainer = document.getElementById('productsContainer');
    productsContainer.innerHTML = '';
    
    for (let i = 0; i < productsToDisplay.length; i++) {
        const product = productsToDisplay[i];
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <h2>${product.name}</h2>
            <p class="price">${product.price} руб.</p>
            <p>${product.description}</p>
            <p class="categories">Категории: ${product.categories.join(', ')}</p>
        `;
        productsContainer.appendChild(productCard);
    }
}

function filterProducts(category) {
    const filteredProducts = [];
    
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        let match = false;
        
        for (let j = 0; j < product.categories.length; j++) {
            if (product.categories[j] === category) {
                match = true;
                break;
            }
        }
        
        if (category === 'all' || match) {
            filteredProducts.push(product);
        }
    }
    
    displayProducts(filteredProducts);
}

const socket = io.connect('http://localhost:5000');

socket.on('message', function(data) {
    addMessage(data.data);
});

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = "Client: " + input.value.trim();
    
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