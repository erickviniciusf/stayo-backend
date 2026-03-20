const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ erro: 'Token nao fornecido' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.hotel = decoded;

    next();

  } catch (erro) {
    return res.status(401).json({ erro: 'Token invalido ou expirado' });
  }
};

module.exports = { autenticar };