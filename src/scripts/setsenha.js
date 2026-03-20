const bcrypt = require('bcryptjs');
const db = require('../config/db');

const definirSenha = async () => {
  const senha = 'stayo2026';
  const hash = await bcrypt.hash(senha, 10);
  await db.query('UPDATE hoteis SET senha_hash = ? WHERE id = ?', [hash, 1]);
  console.log('Senha definida com sucesso!');
  process.exit(0);
};

definirSenha();