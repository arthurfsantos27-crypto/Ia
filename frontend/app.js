const API_URL = 'http://localhost:3000/api';
let currentMode = 'add'; // 'add' or 'edit'

// Authentication
async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if(!username || !password) return alert('Preencha os campos!');

    const res = await fetch(`${API_URL}/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    alert(data.message || data.error);
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    if(res.ok) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
        loadProducts();
    } else {
        alert('Credenciais inválidas!');
    }
}

function logout() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
}

// Product Management
async function loadProducts(query = '') {
    const res = await fetch(`${API_URL}/products${query ? '?search='+query : ''}`);
    const products = await res.json();
    
    const tbody = document.getElementById('productsBody');
    tbody.innerHTML = '';
    
    products.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.description}</td>
                <td>R$ ${p.price.toFixed(2)}</td>
                <td>
                    <button class="btn-edit" onclick="editProduct(${p.id}, '${p.name}', ${p.price}, '${p.description}')">Editar</button>
                    <button class="btn-delete" onclick="deleteProduct(${p.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function searchProducts() {
    const term = document.getElementById('searchInput').value;
    loadProducts(term);
}

// Modal Logic
function showModal(mode, id='', name='', price='', desc='') {
    currentMode = mode;
    document.getElementById('modalTitle').innerText = mode === 'add' ? 'Adicionar Produto' : 'Editar Produto';
    document.getElementById('productId').value = id;
    document.getElementById('prodName').value = name;
    document.getElementById('prodPrice').value = price;
    document.getElementById('prodDesc').value = desc;
    document.getElementById('productModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

function editProduct(id, name, price, desc) {
    showModal('edit', id, name, price, desc);
}

async function deleteProduct(id) {
    if(confirm('Tem certeza que deseja remover este produto por falta de estoque?')) {
        await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        loadProducts();
    }
}

async function saveProduct() {
    const id = document.getElementById('productId').value;
    const name = document.getElementById('prodName').value;
    const price = parseFloat(document.getElementById('prodPrice').value);
    const description = document.getElementById('prodDesc').value;

    // Regra de segurança: Preço não pode ser negativo
    if (price < 0) {
        alert('Erro de Segurança: O preço não pode ser negativo.');
        return;
    }

    const payload = { name, price, description };
    const method = currentMode === 'add' ? 'POST' : 'PUT';
    const url = currentMode === 'add' ? `${API_URL}/products` : `${API_URL}/products/${id}`;

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    if (res.ok) {
        closeModal();
        loadProducts();
    } else {
        alert(data.error || 'Erro ao salvar o produto.');
    }
}
