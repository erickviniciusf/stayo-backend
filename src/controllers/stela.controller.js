const db = require('../config/db');
const { enviarMensagem } = require('../config/twilio');
const groq = require('../config/groq');
const axios = require('axios');
const fs = require('fs');
const path = require('path');


const dispararMensagemInicial = async (req, res) => {
  try {
    const { sessao_id } = req.body;

    const [sessoes] = await db.query('SELECT * FROM sessoes WHERE id = ?', [sessao_id]);
    if (sessoes.length === 0) {
      return res.status(404).json({ erro: 'Sessão não encontrada' });
    }

    const sessao = sessoes[0];
    // Buscar data de check-in da reserva

    const mensagem = `Olá, ${sessao.hospede_nome}! 😊 Sou a Stela. Estamos te esperando para o check-in. O senhor virá de avião ou de carro?`;

    await enviarMensagem(sessao.hospede_telefone, mensagem);

    await db.query(
      'UPDATE sessoes SET status_sessao=?, disparo_enviado_em=NOW() WHERE id=?',
      ['em_conversa', sessao_id]
    ); 
  
    res.json({ mensagem: 'Mensagem enviada com sucesso!' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: erro.message });
  }
};

const transcreverAudio = async (mediaUrl) => {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;

  const response = await axios.get(mediaUrl, {
    responseType: 'arraybuffer',
    auth: { username: accountSid, password: authToken }
  });

  const tempPath = path.join(__dirname, 'temp_audio.ogg');
  fs.writeFileSync(tempPath, response.data);

  const transcricao = await groq.audio.transcriptions.create({
    file: fs.createReadStream(tempPath),
    model: 'whisper-large-v3',
    language: 'pt'
  });

  fs.unlinkSync(tempPath);
  return transcricao.text;
};

const interpretarMensagem = async (textoMensagem, nomeHospede, dataCheckin, historico = [], politicas = null) => {
  const resposta = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
  {
    role: 'system',
    content: `Você é um sistema de interpretação de mensagens de hóspedes de hotel.
Analise a mensagem e retorne SOMENTE um JSON válido com esta estrutura:
{
  "meio_transporte": "aviao" | "carro" | "terrestre" | "indefinido",
  "eta": "horário identificado em formato HH:MM (ex: 15:00, 08:30) ou null. Converta expressões como '15h', '15h00', '3 da tarde', 'de manhã cedo' para HH:MM.",
  "eta_tipo": "exato" | "faixa" | "indefinido",
  "tom": "positivo" | "neutro" | "negativo",
  "necessidades": [],
  "resposta_stela": "resposta natural e humanizada da Stela em português"
}

Necessidades possíveis: "bebe", "pet", "data_comemorativa", "chegada_tardia", "quarto_especial".
${politicas ? `
Políticas do hotel:
- Check-in: ${politicas.checkin_hora} | Check-out: ${politicas.checkout_hora}
- Early check-in: ${politicas.early_checkin_permitido ? `disponível a partir das ${politicas.early_checkin_hora} por R$ ${politicas.early_checkin_valor}` : 'não disponível'}
- Late check-out: ${politicas.late_checkout_disponivel ? `disponível até ${politicas.late_checkout_hora} por R$ ${politicas.late_checkout_valor}` : 'não disponível'}
- Café da manhã: ${politicas.cafe_incluso ? `incluso, servido das ${politicas.cafe_horario_inicio} às ${politicas.cafe_horario_fim}` : 'não incluso'}
- Bagageiro: ${politicas.bagageiro_disponivel ? 'disponível' : 'não disponível'}
` : 'Políticas do hotel não cadastradas — se perguntado, informar que vai verificar com a gerência.'}
O nome do hóspede é ${nomeHospede}.
A resposta_stela deve ser calorosa, humanizada e sem emojis.
Responda apenas o que foi perguntado, de forma direta e natural como um recepcionista humano experiente. Nao adicione ofertas de ajuda, nao pergunte se precisa de mais alguma coisa e nao encerre com frases prestativas no meio da conversa.
A unica excecao e a mensagem de encerramento — quando ja tiver coletado transporte, horario e necessidades, ai sim pode resumir e perguntar "deseja algo mais?".
Identifique o genero pelo nome: homem = "senhor/Sr.", mulher = "senhora/Sra.". Se nao identificar, use o nome diretamente.`
  },
  ...historico.map(msg => ({
    role: msg.remetente === 'hospede' ? 'user' : 'assistant',
    content: msg.conteudo
  })),
  {
    role: 'user',
    content: textoMensagem
  }
]
  });

  const conteudo = resposta.choices[0].message.content;
  return JSON.parse(conteudo);
};

const gerarAlertasOperacionais = async (necessidades, sessao) => {
  if (!necessidades || necessidades.length === 0) return;

  const mapa = {
    bebe:              { prioridade: 'alta',  area: 'governanca',       descricao: 'Hospede viaja com bebe — preparar berco antes da chegada.' },
    pet:               { prioridade: 'alta',  area: 'recepcao',         descricao: 'Hospede viaja com pet — verificar politica e quarto adequado.' },
    data_comemorativa: { prioridade: 'media', area: 'concierge',        descricao: 'Data comemorativa identificada — preparar decoracao ou mimo especial.' },
    chegada_tardia:    { prioridade: 'media', area: 'recepcao_noturna', descricao: 'Hospede chegara apos horario padrao — alertar auditor noturno.' },
    quarto_especial:   { prioridade: 'media', area: 'recepcao',         descricao: 'Hospede solicitou quarto especial — verificar disponibilidade.' },
  };

  for (const necessidade of necessidades) {
    const config = mapa[necessidade];
    if (!config) continue;

    await db.query(
      `INSERT INTO alertas_operacionais 
        (hotel_id, reserva_id, sessao_id, tipo_necessidade, descricao, prioridade, area_responsaveis, status_alerta) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')`,
      [sessao.hotel_id, sessao.reserva_id, sessao.id, necessidade, config.descricao, config.prioridade, config.area]
    );

    console.log(`Alerta criado: ${necessidade} — prioridade ${config.prioridade}`);
  }
};

const receberResposta = async (req, res) => {
  try {
    
    const numeroHospede = req.body.From;
const telefoneNormalizado = numeroHospede.replace('whatsapp:', '');
const mediaUrl = req.body.MediaUrl0;

let textoMensagem = req.body.Body;

if (mediaUrl) {
  console.log('Audio recebido, transcrevendo...');
  textoMensagem = await transcreverAudio(mediaUrl);
  console.log(`Audio transcrito: ${textoMensagem}`);
}
  
    console.log('Webhook chamado!', req.body);
    console.log(`Mensagem recebida de ${numeroHospede}: ${textoMensagem}`);

    // 1. Buscar sessão ativa pelo telefone do hóspede
    const [sessoes] = await db.query(  
      "SELECT * FROM sessoes WHERE hospede_telefone = ? AND status_sessao = 'em_conversa'",
[telefoneNormalizado]
    );

    if (sessoes.length === 0) {
      console.log('Nenhuma sessão ativa encontrada para esse número.');
      return res.status(200).send('<Response></Response>');
    }

    const sessao = sessoes[0];
    // Buscar data de check-in da reserva
const [reservas] = await db.query(
  'SELECT checkin_data FROM reservas WHERE id = ?',
  [sessao.reserva_id]
);
const dataCheckin = reservas.length > 0 ? new Date(reservas[0].checkin_data) : new Date();

// Buscar politicas do hotel
const [politicas] = await db.query(
  'SELECT * FROM politicas_hoteis WHERE hotel_id = ?',
  [sessao.hotel_id]
);
const politicasHotel = politicas.length > 0 ? politicas[0] : null;

// Buscar historico da conversa
const [mensagensAnteriores] = await db.query(
  'SELECT remetente, conteudo FROM mensagens WHERE sessao_id = ? ORDER BY enviado_em ASC LIMIT 10',
  [sessao.id]
);

    // 2. Salvar mensagem recebida no histórico
    await db.query(
      'INSERT INTO mensagens (sessao_id, remetente, conteudo, enviado_em) VALUES (?, ?, ?, NOW())',
      [sessao.id, 'hospede', textoMensagem]
    );

    // 3. Interpretar mensagem com IA

      const interpretacao = await interpretarMensagem(textoMensagem, sessao.hospede_nome, dataCheckin, mensagensAnteriores, politicasHotel);

      // 4. Atualizar sessão com dados identificados
      const updates = [];
      const values = [];

      if (interpretacao.meio_transporte !== 'indefinido') {
        updates.push('meio_transporte = ?');
        values.push(interpretacao.meio_transporte);
      }

      if (interpretacao.eta) {
        const [hora, minuto] = interpretacao.eta.split(':');
        const etaCompleto = new Date(dataCheckin);
        etaCompleto.setHours(parseInt(hora), parseInt(minuto), 0, 0);
        updates.push('eta_previsto = ?');
        values.push(etaCompleto);
        updates.push('eta_tipo = ?');
        values.push(interpretacao.eta_tipo);
      }

      if (interpretacao.tom) {
        updates.push('tom_emocional = ?');
        values.push(interpretacao.tom);
      }

      if (updates.length > 0) {
        values.push(sessao.id);
        await db.query(
          `UPDATE sessoes SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      // 6. Gerar alertas operacionais
      if (interpretacao.necessidades && interpretacao.necessidades.length > 0) {
         await gerarAlertasOperacionais(interpretacao.necessidades, sessao);
      }

      // 5. Enviar resposta da Stela
      const respostaStela = interpretacao.resposta_stela;
      const tempoDigitando = Math.floor(Math.random() * 2000) + 3000;
      await new Promise(resolve => setTimeout(resolve, tempoDigitando));
      await enviarMensagem(telefoneNormalizado, respostaStela);

    // 5. Salvar resposta da Stela no histórico
    await db.query(
      'INSERT INTO mensagens (sessao_id, remetente, conteudo, enviado_em) VALUES (?, ?, ?, NOW())',
      [sessao.id, 'stela', respostaStela]
    );

    res.status(200).send('<Response></Response>');

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: erro.message });
  }
};
module.exports = { dispararMensagemInicial, receberResposta };   