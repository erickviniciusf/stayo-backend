    const db = require('../config/db');

    const listarReserva = async (req, res) => {
        try {
            const [reservas] = await db.query ('SELECT * FROM reservas');
            res.json(reservas);
        } catch (erro) {
            console.error(erro);
            res.status(500).json({ erro: erro.message});

        }
    }; 

    const buscarReserva = async (req, res) => {
        try {
            const { id } = req.params;
            const [reservas] = await db.query ('SELECT * FROM reservas WHERE id =?', [id]);
            if (reservas.length ===0) {
                return res.status(404).json ({ erro: 'Reserva não encontrada'});
            }
            res.json(reservas[0]);
        } catch (erro) {
            console.error(erro);
            res.status(500).json({ erro: erro.message});

        }
    }; 

    const criarReserva = async (req, res) => {
        try {
            const { hotel_id, numero_reserva, hospede_nome, hospede_telefone, checkin_data, checkout_data, origem, status_reserva } = req.body;
            const [resultado] = await db.query ('INSERT INTO reservas (hotel_id, numero_reserva, hospede_nome, hospede_telefone, checkin_data, checkout_data, origem, status_reserva) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                [hotel_id, numero_reserva, hospede_nome, hospede_telefone, checkin_data, checkout_data, origem, status_reserva]
            );
            res.status(201).json({ id: resultado.insertId, mensagem: 'Reserva criada com sucesso!'});
        } catch (erro) {
            console.error(erro);
            res.status(500).json({ erro: erro.message});

        }
    }; 

    const atualizarReservas = async (req, res) => {
        try {
            const { id } = req.params;
            const { status_reserva } = req.body;
            await db.query(
                'UPDATE reservas SET status_reserva=? WHERE id=?', [status_reserva, id]
            );
            res.json({ mensagem: 'Reserva atualizada com sucesso!'});
        } catch (erro) {
            console.error(erro);
            res.status(500).json ({erro: erro.mensagem});
        }
    };

    module.exports = { listarReserva, buscarReserva, criarReserva, atualizarReservas };