const express = require('express');
const router = express.Router();
const { listarSessoes, buscarSessao, criarSessao, atualizarSessao } = require('../controllers/sessoes.controller');
const { autenticar } = require('../middlewares/auth.middleware');
const { validarSessao } = require('../middlewares/validacao.middleware');
const pool = require('../config/db');

router.get('/', autenticar, listarSessoes);
router.post('/', autenticar, validarSessao, criarSessao);
router.get('/:id', autenticar, buscarSessao);
router.put('/:id', autenticar, atualizarSessao);

// Check-outs de amanhã
router.get('/checkout-amanha/:hotel_id', autenticar, async (req, res) => {
    const { hotel_id } = req.params;
    
    try {
        const connection = await pool.getConnection();
        
        const [sessoes] = await connection.query(
            `SELECT 
                s.id,
                s.hospede_nome,
                s.hospede_telefone,
                r.numero_reserva,
                r.checkout_data,
                sm2.quarto_numero,
                s.status_sessao
            FROM sessoes s
            JOIN reservas r ON s.reserva_id = r.id
            LEFT JOIN sessoes_modulo2 sm2 ON s.reserva_id = sm2.reserva_id AND s.hotel_id = sm2.hotel_id
            WHERE s.hotel_id = ? 
            AND DATE(r.checkout_data) = DATE(DATE_ADD(NOW(), INTERVAL 1 DAY))
            ORDER BY r.checkout_data ASC`,
            [hotel_id]
        );
        
        connection.release();
        res.json(sessoes);
    } catch (error) {
        console.error('Erro ao buscar check-outs:', error);
        res.status(500).json({ erro: 'Erro ao buscar check-outs', detalhe: error.message });
    }
});

module.exports = router;