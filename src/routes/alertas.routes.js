// Lista de const:

const express = require('express');
const router = express.Router();
const { listarAlertas, buscarAlertas, atualizarAlertas } = require('../controllers/alertas.controller');

// Lista de routers: 

router.get('/', listarAlertas);
router.get('/:id', buscarAlertas);
router.put('/:id', atualizarAlertas); 

//Sempre colocar o module pra chamar os routers na ultima parte

module.exports = router;