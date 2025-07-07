const jwt = require('jsonwebtoken');

const optionalJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        // No token → continue without setting user
        return next();
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (!err && decoded?.UserInfo?.username) {
            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles;
        }
        // Proceed regardless of error or success
        next();
    });
};

module.exports = optionalJWT;