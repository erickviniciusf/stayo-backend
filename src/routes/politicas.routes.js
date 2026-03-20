const express = require('express');
const router = express.Router();
const { buscarPoliticas, criarPoliticas, atualizarPoliticas } = require('../controllers/politicas.controller');

router.get('/:hotel_id', buscarPoliticas);
router.post('/', criarPoliticas);
router.put('/:hotel_id', atualizarPoliticas);

module.exports = router;