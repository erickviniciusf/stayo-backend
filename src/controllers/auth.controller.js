const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Buscar hotel pelo email
    const [hoteis] = await db.query(
      'SELECT * FROM hoteis WHERE email_admin = ?',
      [email]
    );

    if (hoteis.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha invalidos' });
    }

    const hotel = hoteis[0];

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, hotel.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha invalidos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { hotel_id: hotel.id, nome: hotel.nome },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      hotel: { id: hotel.id, nome: hotel.nome }
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: erro.message });
  }
};

module.exports = { login };