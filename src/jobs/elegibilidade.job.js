const cron = require('node-cron');
const db = require('../config/db');
const { enviarMensagem, validarNumeroWhatsApp } = require('../config/twilio');

const verificarElegibilidade = async () => {
  console.log('Job de elegibilidade iniciado:', new Date().toLocaleString('pt-BR'));

  try {
    // Verificar janela operacional 10h-18h
    const agora = new Date();
    const hora = agora.getHours();

    if (hora < 10 || hora >= 18) {
      console.log('Fora da janela operacional (10h-18h). Job encerrado.');
      return;
    }

    // Buscar reservas elegiveis — check-in nas proximas 24h
    const [reservas] = await db.query(`
      SELECT r.* FROM reservas r
      WHERE r.status_reserva IN ('confirmada', 'garantida', 'confirmada_pagamento', 'confirmada_ota')
      AND r.checkin_data BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
      AND r.id NOT IN (
        SELECT reserva_id FROM sessoes 
        WHERE status_sessao NOT IN ('suspensa', 'sem_resposta')
      )
    `);

    console.log(`${reservas.length} reserva(s) elegivel(is) encontrada(s).`);

    for (const reserva of reservas) {
      try {
                // Validar numero WhatsApp
        const numeroValido = await validarNumeroWhatsApp(reserva.hospede_telefone);
        if (!numeroValido) {
        console.log(`Numero invalido para ${reserva.hospede_nome} — sessao suspensa.`);
        await db.query(
            `INSERT INTO sessoes 
            (hotel_id, reserva_id, hospede_nome, hospede_telefone, status_sessao)
            VALUES (?, ?, ?, ?, 'suspensa')`,
            [reserva.hotel_id, reserva.id, reserva.hospede_nome, reserva.hospede_telefone]
        );
        continue;
        }
        // Criar sessao para a reserva
        const [resultado] = await db.query(
          `INSERT INTO sessoes 
            (hotel_id, reserva_id, hospede_nome, hospede_telefone, status_sessao)
           VALUES (?, ?, ?, ?, 'aguardando_disparo')`,
          [reserva.hotel_id, reserva.id, reserva.hospede_nome, reserva.hospede_telefone]
        );

        const sessaoId = resultado.insertId;

        // Montar e enviar mensagem inicial
        const primeiroNome = reserva.hospede_nome.split(' ')[0];
        const mensagem = `Olá, ${primeiroNome}! 😊 Sou a Stela do hotel. Vimos que amanhã você estará conosco. O senhor virá de avião ou de carro?`;

        await enviarMensagem(reserva.hospede_telefone, mensagem);

        // Atualizar status da sessao
        await db.query(
          `UPDATE sessoes SET status_sessao = 'em_conversa', disparo_enviado_em = NOW() WHERE id = ?`,
          [sessaoId]
        );

        console.log(`Mensagem enviada para ${reserva.hospede_nome} (reserva ${reserva.numero_reserva})`);

      } catch (erroDisparo) {
        // Marcar sessao como suspensa se falhar
        console.error(`Erro ao disparar para ${reserva.hospede_nome}:`, erroDisparo.message);
        await db.query(
          `UPDATE sessoes SET status_sessao = 'suspensa' WHERE reserva_id = ? AND status_sessao = 'aguardando_disparo'`,
          [reserva.id]
        );
      }
    }

  } catch (erro) {
    console.error('Erro no job de elegibilidade:', erro.message);
  }
};

// Rodar a cada hora
const iniciarJob = () => {
  cron.schedule('0 * * * *', verificarElegibilidade, {
    timezone: 'America/Sao_Paulo'
  });
  console.log('Job de elegibilidade agendado — roda a cada hora.');
};

module.exports = { iniciarJob, verificarElegibilidade };