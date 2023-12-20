const jwt = require('jsonwebtoken');

const fetchUser = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    res.status(401).send({ error: "Invalid Authentication Token" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
};

module.exports = fetchUser;
