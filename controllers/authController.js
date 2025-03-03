const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });

    try {
        const foundUser = await User.findOne({ where: { username: user } });
        if (!foundUser) return res.sendStatus(401); // Unauthorized 

        const match = await bcrypt.compare(pwd, foundUser.password);
        if (match) {
            const roles = Object.values(foundUser.roles).filter(Boolean);

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );
            const _refreshToken = jwt.sign(
                { "username": foundUser.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '100d' }
            );

            foundUser.refreshToken = _refreshToken;
            await foundUser.save();

            res.cookie('jwt', _refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

            const { password, refreshToken, ...userWithoutCredentials } = foundUser.dataValues

            return res.json({ roles, accessToken, user: userWithoutCredentials });
        } else {
            return res.sendStatus(401); // Unauthorized 
        }
    } catch (err) {
        return res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleLogin };