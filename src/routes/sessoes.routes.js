const express = require('express');
const router = express.Router();
const { listarSessoes, buscarSessao, criarSessao, atualizarSessao } = require('../controllers/sessoes.controller');

router.get('/', listarSessoes);
router.post('/', criarSessao);
router.get('/:id', buscarSessao);
router.put('/:id', atualizarSessao);

module.exports = router;