const User = require('../model/User');

const uploadImages = require("../middleware/uploadImagesCloudinary");
const uploadFileToStorage = require("../middleware/uploadImagesToStorage");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        if (!users) return res.status(204).json({ 'message': 'No users found' });
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "An error occurred while fetching users." });
    }
}

// const deleteUser = async (req, res) => {
//     try {
//         const username = req.user;
//         const user = await User.findOne({ where: { username } });
//         if (!user) {
//             return res.status(404).json({ 'message': `User is not found` });
//         }

//         user.isDeleted = !user.isDeleted;
//         await user.save();
//         res.json(user);
//     } catch (error) {
//         console.error("Error deleting user:", error);
//         return res.status(500).json({ message: "An error occurred while deleting the user." });
//     }
// }

const getUser = async (req, res) => {
    try {
        if (!req?.params?.username) return res.status(400).json({ "message": 'User ID required' });

        const user = await User.findOne({ where: { username: req?.params?.username } });
        if (!user) {
            return res.status(204).json({ 'message': `User ID ${req.params.username} not found` });
        }
        return res.json(user);
    } catch (error) {
        console.error("Error fetching user's info:", error);
        return res.status(500).json({ message: "An error occurred while fetching user's info." });
    }
}

const getUserInfo = async (req, res) => {
    try {
        const username = req.user;
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ 'message': `User is not found` });
        }
        return res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "An error occurred while fetching the user." });
    }
}

const updateUser = async (req, res) => {
    uploadImages(req, res, async (err) => {
        if (err) return res.status(400).json({ error: "Multer error" });

        try {
            const username = req.user;
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return res.status(404).json({ 'message': `User is not found` });
            }

            const { nickname } = req.body;

            if (!nickname && !req.files[0]) {
                return res.status(400)
                    .json({ message: 'At least one change is required.' });
            }

            if (req.files[0]) {
                const fileExtensionAvatar = req.files[0].mimetype.split("/")[1];
                const fileNameAvatar = `userAvatar-${Date.now()}.${fileExtensionAvatar}`;

                const avatarUrl = await uploadFileToStorage(
                    req.files[0].buffer,
                    fileNameAvatar,
                    "userAvatar",
                    req.files[0].mimetype
                );

                user.avatar = avatarUrl;
            }

            if (nickname) user.nickname = nickname;

            await user.save();

            return res.status(200).json(user);

        } catch (error) {
            console.error("Error updating user:", error);
            return res.status(500).json({ message: "An error occurred while updating the user." });
        }
    });
}

const banUser = async (req, res) => {
    try {
        if (!req?.params?.username) return res.status(400).json({ "message": 'User username required' });
        const user = await User.findOne({ where: { username: req?.params?.username } });

        if (!user) {
            return res.status(204).json({ 'message': `User username ${!req?.params?.username} not found` });
        }
        user.isBanned = !user.isBanned;
        await user.save();
        res.json(user);
    }
    catch (error) {
        console.error("Error updating user's status:", error);
        return res.status(500).json({ message: "An error occurred while updating user's status." });
    }
}

module.exports = {
    getAllUsers,
    deleteUser,
    getUser,
    updateUser,
    banUser,
    getUserInfo
}