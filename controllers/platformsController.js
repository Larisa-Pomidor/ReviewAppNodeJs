const Platform = require("../model/Platform");

const getAllPlatforms = async (req, res) => {
    try {
        const platforms = await Platform.findAll();

        if (platforms.length === 0) {
            return res.status(204).json({ message: 'No platforms found' }); // No Content
        }

        return res.status(200).json(platforms);
    } catch (err) {

        console.error('Error retrieving platforms:', err);
        return res.status(500).json({ message: 'An unexpected error occurred while retrieving platforms.' });
    }
};

module.exports = {
    getAllPlatforms
}