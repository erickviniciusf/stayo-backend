const db = require ('../config/db');

const listarHoteis = async (req, res) => {
    try {
        const [hoteis] = await db.query('SELECT * FROM hoteis');
        res.json(hoteis);
    } catch (error) {
    console.error(error);
    res.status(500).json({ erro: error.message });
  } 
};

const criarHotel = async (req, res) => {
  try {
    const { nome, email, telefone, cidade, estado } = req.body;
    const [resultado] = await db.query(
      'INSERT INTO hoteis (nome, email, telefone, cidade, estado) VALUES (?, ?, ?, ?, ?)',
      [nome, email, telefone, cidade, estado]
    );
    res.status(201).json({ id: resultado.insertId, mensagem: 'Hotel criado com sucesso!' });
  } catch (error) {
    console.error(erro);
    res.status(500).json({ erro: error.message });
  }
};
const buscarHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const [hoteis] = await db.query('SELECT * FROM hoteis WHERE id = ?', [id]);
    if (hoteis.length === 0) {
      return res.status(404).json({ erro: 'Hotel não encontrado'});
    }
    res.json(hoteis[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json ({ erro: erro.message });
  }
};

const atualizarHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, cidade, estado} = req.body;
    await db.query(
      'UPDATE hoteis SET nome=?, email=?, telefone=?, cidade=?, estado=? WHERE id=?'
      [nome, email, telefone, cidade, estado, id]
    );
    res.json({ mensagem: 'Hotel atualizado com sucesso!'});
    } catch (erro) {
      console.error(erro);
      res.status(500).json ({ erro: erro.message });
    }
  };

module.exports = { listarHoteis, criarHotel, buscarHotel, atualizarHotel }; 