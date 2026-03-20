const express = require('express');
const router = express.Router();
const { listarSessoes, buscarSessao, criarSessao, atualizarSessao } = require('../controllers/sessoes.controller');
const { autenticar } = require('../middlewares/auth.middleware');
const { validarSessao } = require('../middlewares/validacao.middleware');

router.get('/', autenticar, listarSessoes);
router.post('/', autenticar, validarSessao, criarSessao);
router.get('/:id', autenticar, buscarSessao);
router.put('/:id', autenticar, atualizarSessao);

module.exports = router;