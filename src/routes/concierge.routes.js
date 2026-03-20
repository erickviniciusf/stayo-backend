const express = require('express');
const router = express.Router();
const { buscarConteudo, criarConteudo, atualizarConteudo } = require('../controllers/concierge.controller');

router.get('/:hotel_id', buscarConteudo);
router.post('/', criarConteudo);
router.put('/:hotel_id', atualizarConteudo);

module.exports = router;