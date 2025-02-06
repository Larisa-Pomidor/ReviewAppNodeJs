const Publisher = require('../model/Publisher');

const getAllPublishers = async (req, res) => {
    try {
        const publishers = await Publisher.findAll();

        if (publishers.length === 0) {
            return res.status(204).json({ message: 'No publishers found' }); // No Content
        }

        return res.status(200).json(publishers);
    } catch (err) {

        console.error('Error retrieving publishers:', err);
        return res.status(500).json({ message: 'An unexpected error occurred while retrieving publishers.' });
    }
};

const getPublisherById = async (req, res) => {
    try {
        const { id } = req.params;

        const publisher = await Publisher.findByPk(id);

        if (!publisher) {
            return res.status(404).json({ message: `Publisher with id ${id} not found` });
        }

        return res.status(200).json(publisher);
    } catch (err) {
        console.error(`Error retrieving publisher with id ${req.params.id}:`, err);

        return res.status(500).json({ message: 'An unexpected error occurred while retrieving the publisher.' });
    }
};

const deletePublisher = async (req, res) => {
    try {
        const { id } = req.params;

        const publisher = await Publisher.findByPk(id);

        if (!publisher) {
            return res.status(404).json({ message: `Publisher with id ${id} not found` });
        }

        await publisher.destroy();

        return res.status(200).json({ message: `Publisher with id ${id} deleted successfully` });
    } catch (err) {
        console.error(`Error deleting publisher with id ${req.params.id}:`, err);
        return res.status(500).json({ message: 'An error occurred while deleting the publisher.' });
    }
};

const addPublisher = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400)
                .json({ message: 'Missing required fields: name.' });
        }

        const newPublisher = await Publisher.create({
            name
        });

        return res.status(200).json(newPublisher);
    } catch (err) {
        console.error('Error adding new publisher:', err);
        return res.status(500).json({ message: 'An error occurred while adding the publisher.' });
    }
};

const updatePublisher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400)
                .json({ message: 'The name field is required.' });
        }

        const publisher = await Publisher.findByPk(id);

        if (!publisher) {
            return res.status(404).json({ message: `Publisher with id ${id} not found` });
        }

        publisher.name = name;

        await publisher.save();

        return res.status(200).json(publisher);
    } catch (err) {
        console.error(`Error updating publisher with id ${req.params.id}:`, err);
        return res.status(500).json({ message: 'An error occurred while updating the publisher.' });
    }
};


module.exports = {
    getAllPublishers,
    getPublisherById,
    addPublisher,
    updatePublisher,
    deletePublisher
}