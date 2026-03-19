const db = require('../config/db');

//Const Listar Alertas

const listarAlertas = async (req, res) => {
    try {
        const [alertas] = await db.query(
            'SELECT * FROM alertas_operacionais ORDER BY prioridade ASC, criado_em DESC'
        );
        res.json(alertas);
    } catch (erro) {
        console.error(erro); 
        res.status(500).json({ erro: erro.message});
    }
}; 

// Const Buscar Alertas

const buscarAlertas = async (req, res) => {
    try {
        const [alertas] = await db.query(
            'SELECT * FROM alertas_operacionais WHERE id = ?'
            [req.params.id]
        );
        if (alertas.length === 0) return res.status(404).json({ erro: 'Alerta não encontrado'});
        res.json(alertas[0]);
    } catch (erro) {
        console.error(erro); 
        res.status(500).json({ erro: erro.message});
    }
}; 

// Const Atualizar Alertas

const atualizarAlertas = async (req, res) => {
    try {
        const { status_alerta } = req.body;
        const resolvido_em = status_alerta === 'resolvido' ? new Date() : null;
        await db.query(
            'UPDATE alertas_operacionais SET status_alerta = ?, resolvido_em = ? WHERE id = ?', [status_alerta, resolvido_em, req.params.id]
        );
        res.json({ mensagem: 'Alerta atualiado com sucesso!'});
    } catch (erro) {
        console.error(erro); 
        res.status(500).json({ erro: erro.message});
    }
};

// Chamada dos modulos: 

module.exports = { listarAlertas, atualizarAlertas, buscarAlertas };
