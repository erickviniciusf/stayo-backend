const db = require ('../config/db');

const listarSessoes = async (req, res) => {
    try {
        const [sessoes] = await db.query('SELECT * FROM sessoes'); 
        res.json(sessoes);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: erro.message });

    }
};

const buscarSessao = async (req, res) => {
    try {
        const { id } = req.params;
        const [sessoes] = await db.query('SELECT * FROM sessoes WHERE id', {id});
        if (sessoes.length === 0) {
            return res.status(404).json({ erro: 'Sessão não encontrada'})
        } 
        res.json(sessoes[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: erro.message });

    }
};

const criarSessao = async (req, res) => {
  try {
    const { hotel_id, reserva_id, hospede_nome, hospede_telefone, status_sessao } = req.body;
    const [resultado] = await db.query(
      'INSERT INTO sessoes (hotel_id, reserva_id, hospede_nome, hospede_telefone, status_sessao) VALUES (?, ?, ?, ?, ?)',
      [hotel_id, reserva_id, hospede_nome, hospede_telefone, status_sessao]
    );
    res.status(201).json({ id: resultado.insertId, mensagem: 'Sessão criada com sucesso!' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: erro.message });
  }
};

const atualizarSessao = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_sessao, tom_emocional, meio_transporte, eta_previsto } = req.body;
    await db.query(
      'UPDATE sessoes SET status_sessao=?, tom_emocional=?, meio_transporte=?, eta_previsto=? WHERE id=?',
      [status_sessao, tom_emocional, meio_transporte, eta_previsto, id]
    );
    res.json({ mensagem: 'Sessão atualizada com sucesso!' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: erro.message });
  }
};

module.exports = { listarSessoes, buscarSessao, criarSessao, atualizarSessao };