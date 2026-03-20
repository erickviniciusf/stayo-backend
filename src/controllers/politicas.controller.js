const db = require('../config/db');

// Const Buscar Politicas; 

const buscarPoliticas = async (req, res) => {
    try {
        const [politicas] = await db.query(
            'SELECT * FROM politicas_hoteis WHERE hotel_id = ?', [req.params.hotel_id]
        );
        if (politicas.length === 0) return res.status(404).json({ erro: 'Politicas não encontradas'});
        res.json(politicas[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: erro.message});
    }
}; 

// Const Criar Politicas;

const criarPoliticas = async (req, res) => {
  try {
    const {
      hotel_id, checkin_hora, checkout_hora,
      early_checkin_permitido, early_checkin_hora, early_checkin_valor,
      cafe_incluso, cafe_horario_inicio, cafe_horario_fim,
      bagageiro_disponivel,
      late_checkout_disponivel, late_checkout_hora, late_checkout_valor
    } = req.body;

    const [resultado] = await db.query(
      `INSERT INTO politicas_hoteis 
        (hotel_id, checkin_hora, checkout_hora,
         early_checkin_permitido, early_checkin_hora, early_checkin_valor,
         cafe_incluso, cafe_horario_inicio, cafe_horario_fim,
         bagageiro_disponivel,
         late_checkout_disponivel, late_checkout_hora, late_checkout_valor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [hotel_id, checkin_hora, checkout_hora,
       early_checkin_permitido, early_checkin_hora, early_checkin_valor,
       cafe_incluso, cafe_horario_inicio, cafe_horario_fim,
       bagageiro_disponivel,
       late_checkout_disponivel, late_checkout_hora, late_checkout_valor]
    );
    res.status(201).json({ mensagem: 'Politicas criadas com sucesso!', id: resultado.insertId });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: erro.message });
  }
};

// Const Atualizar Politicas

const atualizarPoliticas = async (req, res) => {
  try {
    const {
      checkin_hora, checkout_hora,
      early_checkin_permitido, early_checkin_hora, early_checkin_valor,
      cafe_incluso, cafe_horario_inicio, cafe_horario_fim,
      bagageiro_disponivel,
      late_checkout_disponivel, late_checkout_hora, late_checkout_valor
    } = req.body;

    await db.query(
      `UPDATE politicas_hoteis SET
        checkin_hora = ?, checkout_hora = ?,
        early_checkin_permitido = ?, early_checkin_hora = ?, early_checkin_valor = ?,
        cafe_incluso = ?, cafe_horario_inicio = ?, cafe_horario_fim = ?,
        bagageiro_disponivel = ?,
        late_checkout_disponivel = ?, late_checkout_hora = ?, late_checkout_valor = ?
       WHERE hotel_id = ?`,
      [checkin_hora, checkout_hora,
       early_checkin_permitido, early_checkin_hora, early_checkin_valor,
       cafe_incluso, cafe_horario_inicio, cafe_horario_fim,
       bagageiro_disponivel,
       late_checkout_disponivel, late_checkout_hora, late_checkout_valor,
       req.params.hotel_id]
    );
    res.json({ mensagem: 'Politicas atualizadas com sucesso!' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: erro.message });
  }
};

// Modules de chamadas; 

module.exports = { buscarPoliticas, criarPoliticas, atualizarPoliticas };