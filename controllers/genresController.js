const Genre = require('../model/Genre');

const getAllGenres = async (req, res) => {
    try {
        const genres = await Genre.findAll();

        if (genres.length === 0) {
            return res.status(204).json({ message: 'No genres found' }); // No Content
        }

        return res.status(200).json(genres);
    } catch (err) {

        console.error('Error retrieving genres:', err);
        return res.status(500).json({ message: 'An unexpected error occurred while retrieving genres.' });
    }
};

const getGenreById = async (req, res) => {
    try {
        const { id } = req.params;

        const genre = await Genre.findByPk(id);

        if (!genre) {
            return res.status(404).json({ message: `Genre with id ${id} not found` });
        }

        return res.status(200).json(genre);
    } catch (err) {
        console.error(`Error retrieving genre with id ${req.params.id}:`, err);

        return res.status(500).json({ message: 'An unexpected error occurred while retrieving the genre.' });
    }
};

const deleteGenre = async (req, res) => {
    try {
        const { id } = req.params;

        const genre = await Genre.findByPk(id);

        if (!genre) {
            return res.status(404).json({ message: `Genre with id ${id} not found` });
        }

        await genre.destroy();

        return res.status(200).json({ message: `Genre with id ${id} deleted successfully` });
    } catch (err) {
        console.error(`Error deleting genre with id ${req.params.id}:`, err);
        return res.status(500).json({ message: 'An error occurred while deleting the genre.' });
    }
};

const addGenre = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400)
                .json({ message: 'Missing required fields: name.' });
        }

        const newGenre = await Genre.create({
            name
        });

        return res.status(200).json(newGenre);
    } catch (err) {
        console.error('Error adding new genre:', err);
        return res.status(500).json({ message: 'An error occurred while adding the genre.' });
    }
};

const updateGenre = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400)
                .json({ message: 'The name field is required.' });
        }

        const genre = await Genre.findByPk(id);

        if (!genre) {
            return res.status(404).json({ message: `Genre with id ${id} not found` });
        }

        genre.name = name;

        await genre.save();

        return res.status(200).json(genre);
    } catch (err) {
        console.error(`Error updating genre with id ${req.params.id}:`, err);
        return res.status(500).json({ message: 'An error occurred while updating the genre.' });
    }
};


module.exports = {
    getAllGenres,
    getGenreById,
    addGenre,
    updateGenre,
    deleteGenre
}