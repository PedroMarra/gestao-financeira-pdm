const express = require('express');
const cors = require('cors');
require('./config/database'); 

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Rota: Health-check
app.get('/', (req, res) => {
  res.json({ ok: true, name: "gestao-financeira-api" });
});

// Importando e usando as rotas de Categorias
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/categories', categoryRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});