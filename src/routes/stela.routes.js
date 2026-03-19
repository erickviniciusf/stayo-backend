const express = require('express');
const router = express.Router();
const { dispararMensagemInicial, receberResposta } = require('../controllers/stela.controller');

router.post('/disparar', dispararMensagemInicial); 
router.post('/webhook', receberResposta);

module.exports = router; 