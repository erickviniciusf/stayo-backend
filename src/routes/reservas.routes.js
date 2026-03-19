const express = require('express');
const router = express.Router();
const { listarReserva, buscarReserva, criarReserva, atualizarReservas } = require('../controllers/reservas.controller');


router.get('/', listarReserva);
router.post('/', criarReserva);
router.get('/:id', buscarReserva);
router.put('/:id', atualizarReservas);

module.exports = router;