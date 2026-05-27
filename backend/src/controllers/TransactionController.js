const { z } = require('zod');

const transactionSchema = z.object({
  title: z.string().min(3, "O título precisa ter pelo menos 3 letras"),
  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "O tipo deve ser 'income' ou 'expense'" })
  }),
  amount: z.number().positive("O valor deve ser maior que zero"),
  categoryId: z.number().int().positive("ID da categoria inválido"),
  date: z.string().datetime("A data deve estar no formato ISO (ex: 2026-05-27T10:00:00Z)")
});

const db = require('../config/database');

module.exports = {
  create(req, res) {
    // 1. O Zod analisa os dados enviados na requisição
    const validation = transactionSchema.safeParse(req.body);

    // 2. Se a validação falhar, barramos na porta e mostramos o erro
    if (!validation.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.issues
      });
    }

    // 3. Se os dados estiverem perfeitos, nós os separamos
    const { title, type, amount, categoryId, date } = validation.data;

    // 4. Inserimos na tabela do banco de dados
    const sql = `INSERT INTO transactions (title, type, amount, categoryId, date) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [title, type, amount, categoryId, date], function(err) {
      if (err) {
        console.error("Erro real do SQLite:", err.message);
        return res.status(500).json({ error: "Erro no banco", detalhe: err.message });
      }
      
      // 5. Retornamos status 201 (Criado) com os dados e o ID gerado
      return res.status(201).json({
        id: this.lastID,
        title,
        type,
        amount,
        categoryId,
        date
      });
    });
  },

  // 6. Função para listar as transações (GET)
  list(req, res) {
    const sql = `SELECT * FROM transactions`;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao buscar transações." });
      }
      return res.json(rows); // Devolve a lista toda em JSON
    });
  }, // <-- Vírgula separando o list do delete

  // 7. Função para deletar uma transação (DELETE)
  delete(req, res) {
    const { id } = req.params; // Pega o ID que vem na URL
    const sql = `DELETE FROM transactions WHERE id = ?`;
    
    db.run(sql, [id], function(err) {
      if (err) {
        return res.status(500).json({ error: "Erro ao deletar transação." });
      }
      // Se "this.changes" for 0, significa que nenhum ID bateu com a busca
      if (this.changes === 0) {
        return res.status(404).json({ error: "Transação não encontrada." });
      }
    return res.status(204).send();
    });
  }
};