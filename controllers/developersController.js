const Developer = require('../model/Developer');
const Review = require('../model/Review');

const getAllDevelopers = async (req, res) => {
    try {
        const developers = await Developer.findAll();

        if (developers.length === 0) {
            return res.status(204).json({ message: 'No developers found' }); // No Content
        }

        return res.status(200).json(developers);
    } catch (err) {

        console.error('Error retrieving developers:', err);
        return res.status(500).json({ message: 'An unexpected error occurred while retrieving developers.' });
    }
};

const getDeveloperById = async (req, res) => {
    try {
        const { id } = req.params;

        const developer = await Developer.findByPk(id);

        if (!developer) {
            return res.status(404).json({ message: `Developer with id ${id} not found` });
        }

        return res.status(200).json(developer);
    } catch (err) {
        console.error(`Error retrieving developer with id ${req.params.id}:`, err);

        return res.status(500).json({ message: 'An unexpected error occurred while retrieving the developer.' });
    }
};

const deleteDeveloper = async (req, res) => {
    try {
        const { id } = req.params;

        const developer = await Developer.findByPk(id);

        if (!developer) {
            return res.status(404).json({ message: `Developer with id ${id} not found` });
        }

        const reviews = await Review.findAll({ where: { developerId: id } });

        if (reviews.length > 0) {
            return res.status(400).json({ message: `Developer with id ${id} has associated reviews and cannot be deleted.` });
        }

        await developer.destroy();

        return res.status(200).json({ message: `Developer with id ${id} deleted successfully` });
    } catch (err) {
        console.error(`Error deleting developer with id ${req.params.id}:`, err);
        return res.status(500).json({ message: 'An error occurred while deleting the developer.' });
    }
};

const addDeveloper = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400)
                .json({ message: 'Missing required fields: name.' });
        }

        const newDeveloper = await Developer.create({
            name
        });

        return res.status(200).json(newDeveloper);
    } catch (err) {
        console.error('Error adding new developer:', err);
        return res.status(500).json({ message: 'An error occurred while adding the developer.' });
    }
};

const updateDeveloper = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400)
                .json({ message: 'The name field is required.' });
        }

        const developer = await Developer.findByPk(id);

        if (!developer) {
            return res.status(404).json({ message: `Developer with id ${id} not found` });
        }

        developer.name = name;

        await developer.save();

        return res.status(200).json(developer);
    } catch (err) {
        console.error(`Error updating developer with id ${req.params.id}:`, err);
        return res.status(500).json({ message: 'An error occurred while updating the developer.' });
    }
};


module.exports = {
    getAllDevelopers,
    getDeveloperById,
    addDeveloper,
    updateDeveloper,
    deleteDeveloper
}