const validarReserva = (req, res, next) => {
  const { hotel_id, hospede_nome, hospede_telefone, checkin_data, checkout_data, numero_reserva, status_reserva } = req.body;

  if (!hotel_id) return res.status(400).json({ erro: 'hotel_id e obrigatorio' });
  if (!hospede_nome) return res.status(400).json({ erro: 'hospede_nome e obrigatorio' });
  if (!hospede_telefone) return res.status(400).json({ erro: 'hospede_telefone e obrigatorio' });
  if (!checkin_data) return res.status(400).json({ erro: 'checkin_data e obrigatorio' });
  if (!checkout_data) return res.status(400).json({ erro: 'checkout_data e obrigatorio' });
  if (!numero_reserva) return res.status(400).json({ erro: 'numero_reserva e obrigatorio' });
  if (!status_reserva) return res.status(400).json({ erro: 'status_reserva e obrigatorio' });

  const checkin = new Date(checkin_data);
  const checkout = new Date(checkout_data);
  if (checkout <= checkin) return res.status(400).json({ erro: 'checkout_data deve ser posterior ao checkin_data' });

  next();
};

const validarSessao = (req, res, next) => {
  const { hotel_id, reserva_id, hospede_nome, hospede_telefone } = req.body;

  if (!hotel_id) return res.status(400).json({ erro: 'hotel_id e obrigatorio' });
  if (!reserva_id) return res.status(400).json({ erro: 'reserva_id e obrigatorio' });
  if (!hospede_nome) return res.status(400).json({ erro: 'hospede_nome e obrigatorio' });
  if (!hospede_telefone) return res.status(400).json({ erro: 'hospede_telefone e obrigatorio' });

  next();
};

const validarHotel = (req, res, next) => {
  const { nome } = req.body;

  if (!nome) return res.status(400).json({ erro: 'nome e obrigatorio' });

  next();
};

module.exports = { validarReserva, validarSessao, validarHotel };