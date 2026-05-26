const express = require('express');
const cors = require('cors');
require('./config/database'); // Inicializa o banco de dados

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota: Health-check
app.get('/', (req, res) => {
  res.json({ ok: true, name: "gestao-financeira-api" });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});