const db = require('../config/db');

// Const Buscar Conteudo

const buscarConteudo = async (req, res) => {
  try {
    const [conteudo] = await db.query(
      'SELECT * FROM hoteis_conteudo_concierge WHERE hotel_id = ?',
      [req.params.hotel_id]
    );
    if (conteudo.length === 0) return res.status(404).json({ erro: 'Conteudo nao encontrado' });
    res.json(conteudo[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: erro.message });
  }
};

// Const Criar Conteudo:

const criarConteudo = async (req, res) => {
  try {
    const {
      hotel_id, wifi_rede, wifi_senha,
      horario_piscina_inicio, horario_piscina_fim,
      horario_academia_inicio, horario_academia_fim,
      horario_restaurante_inicio, horario_restaurante_fim,
      menu_pt, menu_en, mapa_url
    } = req.body;

    const [resultado] = await db.query(
      `INSERT INTO hoteis_conteudo_concierge
        (hotel_id, wifi_rede, wifi_senha,
         horario_piscina_inicio, horario_piscina_fim,
         horario_academia_inicio, horario_academia_fim,
         horario_restaurante_inicio, horario_restaurante_fim,
         menu_pt, menu_en, mapa_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [hotel_id, wifi_rede, wifi_senha,
       horario_piscina_inicio, horario_piscina_fim,
       horario_academia_inicio, horario_academia_fim,
       horario_restaurante_inicio, horario_restaurante_fim,
       menu_pt, menu_en, mapa_url]
    );
    res.status(201).json({ mensagem: 'Conteudo criado com sucesso!', id: resultado.insertId });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: erro.message });
  }
};

// Const Atualizar Conteudo:

const atualizarConteudo = async (req, res) => {
  try {
    const {
      wifi_rede, wifi_senha,
      horario_piscina_inicio, horario_piscina_fim,
      horario_academia_inicio, horario_academia_fim,
      horario_restaurante_inicio, horario_restaurante_fim,
      menu_pt, menu_en, mapa_url
    } = req.body;

    await db.query(
      `UPDATE hoteis_conteudo_concierge SET
        wifi_rede = ?, wifi_senha = ?,
        horario_piscina_inicio = ?, horario_piscina_fim = ?,
        horario_academia_inicio = ?, horario_academia_fim = ?,
        horario_restaurante_inicio = ?, horario_restaurante_fim = ?,
        menu_pt = ?, menu_en = ?, mapa_url = ?
       WHERE hotel_id = ?`,
      [wifi_rede, wifi_senha,
       horario_piscina_inicio, horario_piscina_fim,
       horario_academia_inicio, horario_academia_fim,
       horario_restaurante_inicio, horario_restaurante_fim,
       menu_pt, menu_en, mapa_url,
       req.params.hotel_id]
    );
    res.json({ mensagem: 'Conteudo atualizado com sucesso!' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: erro.message });
  }
};

// Modules de chamadas: 

module.exports = { buscarConteudo, criarConteudo, atualizarConteudo };