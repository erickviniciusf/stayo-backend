const express = require('express');
const router = express.Router();
const { listarHoteis, criarHotel, buscarHotel, atualizarHotel } = require('../controllers/hoteis.controller');
const { autenticar } = require('../middlewares/auth.middleware');
const { validarHotel } = require('../middlewares/validacao.middleware');

router.get('/', autenticar, listarHoteis);
router.post('/', autenticar, validarHotel, criarHotel);
router.get('/:id', autenticar, buscarHotel);
router.put('/:id', autenticar, atualizarHotel);

module.exports = router;