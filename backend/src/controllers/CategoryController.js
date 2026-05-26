const db = require('../config/database');

module.exports = {
  // 3. Listar categorias
  async index(req, res) {
    db.all("SELECT * FROM categories", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  },

  // 4. Criar uma nova categoria
  async create(req, res) {
    const { name, displayName, icon, background, isIncome } = req.body;
    
    const query = `INSERT INTO categories (name, displayName, icon, background, isIncome, isDefault) VALUES (?, ?, ?, ?, ?, 0)`;
    const values = [name, displayName, icon, background, isIncome ? 1 : 0];

    db.run(query, values, function(err) {
      if (err) return res.status(400).json({ error: "Erro ao criar categoria. Verifique se o nome já existe." });
      
      // Retorna 201 Created com o objeto montado
      res.status(201).json({
        id: this.lastID,
        name,
        displayName,
        icon,
        background,
        isIncome: isIncome ? 1 : 0,
        isDefault: 0
      });
    });
  },

  // 5. Atualizar categoria
  async update(req, res) {
    const { id } = req.params;
    const { displayName } = req.body;

    db.run(`UPDATE categories SET displayName = ? WHERE id = ?`, [displayName, id], function(err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Categoria não encontrada." });
      
      res.json({ id: Number(id), displayName });
    });
  },

  // 6. Excluir categoria
  async delete(req, res) {
    const { id } = req.params;

    // Primeiro, checamos se a categoria é padrão (isDefault)
    db.get("SELECT isDefault FROM categories WHERE id = ?", [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Categoria não encontrada." });
      
      // Regra de negócio exigida:
      if (row.isDefault === 1) {
        return res.status(400).json({ error: "Categorias padrão não podem ser excluídas" });
      }

      // Se não for padrão, exclui
      db.run("DELETE FROM categories WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(204).send(); // 204 No Content
      });
    });
  }
};