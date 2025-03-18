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
    uploadImages(req, res, async (err) => {
        if (err) return res.status(400).json({ error: "Multer error" });

        const { id } = req.params;

        try {
            const { nameRu, nameEn, nameUk, textRu, textEn, textUk, isSummary } = req.body;

            if (!nameRu || !nameEn || nameUk || !textRu || !textEn || !textUk) {
                return res.status(400)
                    .json({ message: 'Fields: nameRu, nameEn, nameUk, textRu, textEn, textUk are required.' });
            }

            const review = await Review.findByPk(id);
            if (!review) {
                return res.status(404).json({ message: `Review with id ${id} not found` });
            }

            let sectionImageUrl;

            if (req.files.image) {
                const fileExtensionSectionImage = req.files.image[0].mimetype.split("/")[1];
                const fileNameSectionImage = `section-${Date.now()}.${fileExtensionSectionImage}`;

                sectionImageUrl = await uploadFileToStorage(
                    req.files.gamePoster[0].buffer,
                    fileNameSectionImage,
                    "sections",
                    fileExtensionSectionImage
                );
            }

            const newSection = await Section.create({
                nameRu,
                nameEn,
                nameUk,
                textRu,
                textEn,
                textUk,
                ...(req.files.image && { image: sectionImageUrl }),
                isSummary: isSummary || false,
                reviewId: id
            });

            return res.status(200).json(newSection);
        } catch (err) {
            console.error('Error adding new review:', err);
            return res.status(500).json({ message: 'An error occurred while adding the review.' });
        }
    });
};

const updateSection = async (req, res) => {
    uploadImages(req, res, async (err) => {
        if (err) return res.status(400).json({ error: "Multer error" });

        try {
            const { id } = req.params;

            const { nameRu, nameEn, nameUk, textRu, textEn, textUk, isSummary } = req.body;

            if (!nameRu && !nameEn && nameUk && !textRu && !textEn && !textUk && !isSummary) {
                return res.status(400)
                    .json({ message: 'At least one of the fields: nameRu, nameEn, nameUk, textRu, textEn, textUk are required.' });
            }

            const section = await Section.findByPk(id);

            if (!section) {
                return res.status(404).json({ message: `Section with id ${id} not found` });
            }

            let sectionImageUrl;

            if (req.files.image) {
                const fileExtensionSectionImage = req.files.image[0].mimetype.split("/")[1];
                const fileNameSectionImage = `section-${Date.now()}.${fileExtensionSectionImage}`;

                sectionImageUrl = await uploadFileToStorage(
                    req.files.gamePoster[0].buffer,
                    fileNameSectionImage,
                    "sections",
                    fileExtensionSectionImage
                );

                section.image = sectionImageUrl
            }

            if (nameRu) section.nameRu = nameRu;
            if (nameEn) section.nameEn = nameEn;
            if (nameUk) section.nameUk = nameUk;
            if (textRu) section.textRu = textRu;
            if (textEn) section.textEn = textEn;
            if (textUk) section.textUk = textUk;
            if (isSummary) section.isSummary = isSummary;

            await section.save();

            return res.status(200).json(section);
        } catch (err) {
            console.error(`Error updating section with id ${id}:`, err);
            return res.status(500).json({ message: 'An error occurred while updating the section.' });
        }
    });
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