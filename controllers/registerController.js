const User = require('../model/User');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const { user, nick, pwd } = req.body;
    
    if (!user || !pwd || !nick) return res.status(400).json({ 'message': 'Username, nickname, and password are required.' });

    try {
        const duplicateUsername = await User.findOne({ where: { username: user } });
        if (duplicateUsername) return res.sendStatus(409); // Conflict 
        
        const duplicateNickname = await User.findOne({ where: { nickname: nick } });
        if (duplicateNickname) return res.sendStatus(409); // Conflict 

        const hashedPwd = await bcrypt.hash(pwd, 10);
        
        await User.create({
            username: user,
            password: hashedPwd,
            nickname: nick
        });

        return res.status(201).json({ 'success': `New user ${user} created!` }); // Created
    } catch (err) {
        return res.status(500).json({ 'message': err.message });
    }
};

module.exports = { handleNewUser };