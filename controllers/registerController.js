const User = require('../model/User');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });

    try {
        const duplicate = await User.findOne({ where: { username: user } });
        if (duplicate) return res.sendStatus(409); // Conflict 

        const hashedPwd = await bcrypt.hash(pwd, 10);

        await User.create({
            username: user,
            password: hashedPwd
        });

        res.status(201).json({ 'success': `New user ${user} created!` }); // Created
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

module.exports = { handleNewUser };