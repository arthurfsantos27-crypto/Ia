const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory mock database
let products = [
    { id: 1, name: 'Geladeira Frost Free Electrolux', price: 2599.00, description: 'Preço baixo garantido! 371 Litros' },
    { id: 2, name: 'Micro-ondas Electrolux', price: 499.00, description: '31 Litros, Painel Integrado' },
    { id: 3, name: 'Máquina de Lavar Electrolux', price: 1699.00, description: '13kg com tecnologia Jet&Clean' }
];

let admins = [];

// Admin Register
app.post('/api/admin/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Dados inválidos' });
    admins.push({ username, password }); // simplified
    res.json({ message: 'Administrador cadastrado com sucesso!' });
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin || (username === 'admin' && password === 'admin')) {
        res.json({ message: 'Login realizado com sucesso!', token: 'mock-jwt-token' });
    } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
    }
});

// Get Products (with Search)
app.get('/api/products', (req, res) => {
    const { search } = req.query;
    if (search) {
        const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        return res.json(filtered);
    }
    res.json(products);
});

// Create Product
app.post('/api/products', (req, res) => {
    const { name, price, description } = req.body;
    
    // Security / Business Rule: No negative prices
    if (price < 0) {
        return res.status(400).json({ error: 'O preço não pode ser negativo.' });
    }
    
    const newProduct = {
        id: Date.now(),
        name,
        price,
        description
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Update Product
app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, price, description } = req.body;
    
    // Security / Business Rule: No negative prices
    if (price < 0) {
        return res.status(400).json({ error: 'O preço não pode ser negativo.' });
    }

    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { id, name, price, description };
        res.json(products[index]);
    } else {
        res.status(404).json({ error: 'Produto não encontrado.' });
    }
});

// Delete Product
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    products = products.filter(p => p.id !== id);
    res.json({ message: 'Produto excluído com sucesso.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
