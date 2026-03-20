const express = require('express');
const router = express.Router();
const { listarReserva, buscarReserva, criarReserva, atualizarReservas } = require('../controllers/reservas.controller');
const { autenticar } = require('../middlewares/auth.middleware');
const { validarReserva } = require('../middlewares/validacao.middleware');

router.get('/', autenticar, listarReserva);
router.post('/', autenticar, validarReserva, criarReserva);
router.get('/:id', autenticar, buscarReserva);
router.put('/:id', autenticar, atualizarReservas);

module.exports = router;