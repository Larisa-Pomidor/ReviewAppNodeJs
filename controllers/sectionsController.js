const Review = require('../model/Review');
const Section = require('../model/Section');

const getSectionsByReviewId = async (req, res) => {
    const { id } = req.params;

    try {
        const sections = await Section.findAll({
            where: { reviewId: id }
        });

        if (sections.length === 0) {
            return res.status(204).json({ message: 'No sections found' }); // No Content
        }

        return res.status(200).json(sections);
    } catch (err) {
        console.error('Error retrieving sections:', err);
        return res.status(500).json({ message: 'An unexpected error occurred while retrieving sections.' });
    }
};

const addSection = async (req, res) => {
    const { id } = req.params;

    try {
        const { name, text, image } = req.body;

        if (!name || !text) {
            return res.status(400)
                .json({ message: 'Missing required fields: name, text' });
        }

        const review = await Review.findByPk(id);
        if (!review) {
            return res.status(404).json({ message: `Review with id ${id} not found` });
        }

        const newSection = await Section.create({
            name,
            text,
            ...(image && { image })
        });

        return res.status(200).json(newSection);
    } catch (err) {
        console.error('Error adding new review:', err);
        return res.status(500).json({ message: 'An error occurred while adding the review.' });
    }
};

const updateSection = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { sectionId } = req.params;
        const { name, title, image } = req.body;

        if (
            !name && !title && !image
        ) {
            return res.status(400).json({ message: 'At least one change is required.' });
        }

        const review = await Review.findByPk(reviewId);

        if (!review) {
            return res.status(404).json({ message: `Review with id ${reviewId} not found` });
        }

        const section = await Section.findByPk(sectionId);

        if (!section) {
            return res.status(404).json({ message: `Section with id ${sectionId} not found` });
        }

        if (name) section.name = name;
        if (title) section.title = title;
        if (image) section.image = image;        

        await section.save();

        return res.status(200).json(section);
    } catch (err) {
        console.error(`Error updating section with id ${id}:`, err);
        return res.status(500).json({ message: 'An error occurred while updating the section.' });
    }
};

const deleteSection = async (req, res) => {
    try {
        const { id } = req.params;

        const section = await Section.findByPk(id);

        if (!section) {
            return res.status(404).json({ message: `Section with id ${id} not found` });
        }

        await section.destroy();

        return res.status(200).json({ message: `Section with id ${id} deleted successfully` });
    } catch (err) {
        console.error(`Error deleting section with id ${req.params.id}:`, err);
        return res.status(500).json({ message: 'An error occurred while deleting the section.' });
    }
};

module.exports = {
    getSectionsByReviewId,
    addSection,
    updateSection,
    deleteSection
}