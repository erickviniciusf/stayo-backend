const twilio = require('twilio');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Const Enviar Mensagem: 

const enviarMensagem = async (para, mensagem) => {
  try {
    const msg = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${para}`,
      body: mensagem
    });
    console.log(`Mensagem enviada! SID: ${msg.sid}`);
    return msg;
  } catch (erro) {
    console.error('Erro ao enviar mensagem:', erro.message);
    throw erro;
  }
};

// Const Validar numero do WhatsApp:

const validarNumeroWhatsApp = async (numero) => {
  try {
    const lookup = await client.lookups.v2.phoneNumbers(numero)
      .fetch({ fields: 'channel_eligibility' });

    const whatsapp = lookup.channelEligibility?.whatsapp;
    const elegivel = whatsapp?.status === 'eligible';

    console.log(`Lookup ${numero}: ${elegivel ? 'elegivel' : 'nao elegivel'}`);
    return elegivel;

  } catch (erro) {
    console.error(`Erro no Lookup para ${numero}:`, erro.message);
    return false;
  }
};

module.exports = { enviarMensagem, validarNumeroWhatsApp };    