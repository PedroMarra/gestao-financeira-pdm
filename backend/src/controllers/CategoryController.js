const { z } = require('zod');
const db = require('../config/database');

const categorySchema = z.object({
  name: z.string().min(2, "Nome precisa ter pelo menos 2 caracteres").optional(),
  displayName: z.string().min(2, "Nome de exibição inválido").optional(),
  icon: z.string().optional(),
  background: z.string().optional(),
  isIncome: z.boolean().optional()
});

module.exports = {
  // 3. Listar categorias (Renomeado para 'list' para casar com as rotas)
  list(req, res) {
    db.all("SELECT * FROM categories", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      // Formata os booleanos para o frontend
      const formattedRows = rows.map(row => ({
        ...row,
        isIncome: row.isIncome === 1,
        isDefault: row.isDefault === 1
      }));
      res.json(formattedRows);
    });
  },

  // 4. Criar uma nova categoria
  create(req, res) {
    const validation = categorySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Dados inválidos", details: validation.error.issues });
    }

    const { name, displayName, icon, background, isIncome } = validation.data;
    const isIncomeInt = isIncome ? 1 : 0; 
    
    const query = `INSERT INTO categories (name, displayName, icon, background, isIncome, isDefault) VALUES (?, ?, ?, ?, ?, 0)`;
    const values = [name, displayName, icon, background, isIncomeInt];

    db.run(query, values, function(err) {
      if (err) return res.status(400).json({ error: "Erro ao criar categoria. Verifique se o nome já existe." });
      
      res.status(201).json({
        id: this.lastID,
        name,
        displayName,
        icon,
        background,
        isIncome: isIncomeInt === 1,
        isDefault: false
      });
    });
  },

  // 5. Atualizar categoria
  update(req, res) {
    const { id } = req.params;
    const validation = categorySchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ error: "Dados inválidos", details: validation.error.issues });
    }

    const { displayName } = validation.data;

    db.run(`UPDATE categories SET displayName = ? WHERE id = ?`, [displayName, id], function(err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Categoria não encontrada." });
      
      res.json({ id: Number(id), displayName });
    });
  },

  // 6. Excluir categoria
  delete(req, res) {
    const { id } = req.params;

    db.get("SELECT isDefault FROM categories WHERE id = ?", [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Categoria não encontrada." });
      
      if (row.isDefault === 1) {
        return res.status(400).json({ error: "Categorias padrão não podem ser excluídas" });
      }

      db.run("DELETE FROM categories WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(204).send();
      });
    });
  }
};