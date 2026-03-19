const express = require ('express');
const router = express.Router();
const { listarHoteis, criarHotel, buscarHotel, atualizarHotel } = require ('../controllers/hoteis.controller');


router.get('/', listarHoteis);
router.post('/', criarHotel);
router.get('/:id', buscarHotel);
router.put('/:id', atualizarHotel);

module.exports = router;