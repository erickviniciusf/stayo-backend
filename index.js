const express = require('express');
const dotenv = require('dotenv');
const db = require('./src/config/db')
const hoteisRoutes = require('./src/routes/hoteis.routes');
const reservasRoutes = require('./src/routes/reservas.routes');
const sessoesRoutes = require('./src/routes/sessoes.routes');
const stelaRoutes = require('./src/routes/stela.routes');
const alertasRoutes = require('./src/routes/alertas.routes');
const politicasRoutes = require('./src/routes/politicas.routes');
const conciergeRoutes = require('./src/routes/concierge.routes');
const authRoutes = require('./src/routes/auth.routes');
const { autenticar } = require('./src/middlewares/auth.middleware');
const { iniciarJob } = require('./src/jobs/elegibilidade.job');


dotenv.config();

const app =express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use('/api/hoteis', autenticar, hoteisRoutes);
app.use('/api/reservas', autenticar, reservasRoutes);
app.use('/api/sessoes', autenticar, sessoesRoutes);
app.use('/api/alertas', autenticar, alertasRoutes);
app.use('/api/politicas', autenticar, politicasRoutes);
app.use('/api/concierge', autenticar, conciergeRoutes);
app.use('/api/auth', authRoutes);
app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  res.status(500).json({ erro: err.message });
});

app.get('/', (req, res) => {
    res.json({ mensagem : 'Stay.io API rodando!'});
});

db.getConnection()
    .then(() => {
        console.log('Banco de dados conectado com sucesso');
        iniciarJob(); 
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Erro ao conectar no banco:', err.message);
});