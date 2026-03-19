const twilio = require('twilio');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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

module.exports = { enviarMensagem };    