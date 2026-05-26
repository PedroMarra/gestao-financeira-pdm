const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Cria o arquivo do banco na raiz da pasta backend
const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    initDB();
  }
});

function initDB() {
  db.serialize(() => {
    // Tabela de Categorias
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      displayName TEXT,
      icon TEXT,
      background TEXT,
      isIncome INTEGER,
      isDefault INTEGER DEFAULT 0
    )`);

    // Tabela de Transações
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT,
      value REAL,
      date TEXT,
      categoryId INTEGER,
      FOREIGN KEY(categoryId) REFERENCES categories(id)
    )`);

    // Seed: Inserir as 5 categorias padrão se o banco estiver vazio
    db.get("SELECT COUNT(*) as count FROM categories", (err, row) => {
      if (row && row.count === 0) {
        const insert = db.prepare(`INSERT INTO categories (name, displayName, icon, background, isIncome, isDefault) VALUES (?, ?, ?, ?, ?, ?)`);
        
        insert.run('income', 'Receitas', 'attach-money', '#4CAF50', 1, 1);
        insert.run('food', 'Alimentação', 'restaurant', '#FF9800', 0, 1);
        insert.run('transport', 'Transporte', 'directions-car', '#2196F3', 0, 1);
        insert.run('housing', 'Moradia', 'home', '#9C27B0', 0, 1);
        insert.run('leisure', 'Lazer', 'sports-esports', '#FFEB3B', 0, 1);
        
        insert.finalize();
      }
    });
  });
}

module.exports = db;