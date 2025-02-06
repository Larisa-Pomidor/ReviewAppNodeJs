const GenreReview = require('../model/GenresReview');
const PlatformReview = require('../model/PlatformReview');
const Platform = require('../model/Platform');
const Genre = require('../model/Genre');
const Review = require('../model/Review');
const Publisher = require('../model/Publisher');
const Developer = require('../model/Developer');
const Section = require('../model/Section');

const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: Genre, as: 'genres', through: { attributes: [] } },
                {
                    model: Platform,
                    as: 'platforms',
                    through: { attributes: [] },
                    required: false
                },
                {
                    model: Section,
                    as: 'sections',
                    attributes: {
                        exclude: ['reviewId', 'review_id']
                    }
                }
            ],
            attributes: {
                exclude: ['publisher_id', 'developer_id', 'publisherId', 'developerId']
            }
        });

        if (reviews.length === 0) {
            return res.status(204).json({ message: 'No reviews found' }); // No Content
        }

        return res.status(200).json(reviews);
    } catch (err) {
        console.error('Error retrieving reviews:', err);
        return res.status(500).json({ message: 'An unexpected error occurred while retrieving reviews.' });
    }
};

const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id, {
            include: [
                { model: Genre, as: 'genres', through: { attributes: [] } },
                {
                    model: Platform,
                    as: 'platforms',
                    through: { attributes: [] },
                    required: false
                },
                {
                    model: Section,
                    as: 'sections',
                    attributes: {
                        exclude: ['reviewId', 'review_id']
                    }
                }
            ],
            attributes: {
                exclude: ['publisher_id', 'developer_id', 'publisherId', 'developerId']
            }
        });

        if (!review) {
            return res.status(404).json({ message: `Review with id ${id} not found` });
        }

        return res.status(200).json(review);
    } catch (err) {
        console.error(`Error retrieving review with id ${req.params.id}:`, err);
        return res.status(500).json({ message: 'An unexpected error occurred while retrieving the review.' });
    }
};

const addReview = async (req, res) => {
    try {
        const { gameTitle, gamePoster, gameReleaseDate, adminRating,
            developerId, publisherId, genreIds, platformIds } = req.body;

        if (!gameTitle || !gamePoster || !gameReleaseDate || !adminRating
            || !developerId || !publisherId) {
            return res.status(400)
                .json({ message: 'Missing required fields: gameTitle, gamePoster, gameReleaseDate, adminRating, developerId, publisherId' });
        }

        const developer = await Developer.findByPk(developerId);
        if (!developer) {
            return res.status(404).json({ message: `Developer with id ${developerId} not found` });
        }

        const publisher = await Publisher.findByPk(publisherId);
        if (!publisher) {
            return res.status(404).json({ message: `Publisher with id ${publisherId} not found` });
        }

        const newReview = await Review.create({
            gameTitle,
            gamePoster,
            gameReleaseDate,
            adminRating,
            developerId,
            publisherId
        });

        if (genreIds && genreIds.length > 0) {

            const genres = await Genre.findAll({
                where: { id: genreIds }
            });

            if (genres.length !== genreIds.length) {
                return res.status(404).json({ message: 'One or more genres not found' });
            }

            await Promise.all(
                genres.map(async (genre) => {

                    await GenreReview.create({
                        reviewId: newReview.id,
                        genreId: genre.id
                    });
                })
            );
        }

        if (platformIds && platformIds.length > 0) {
            const platforms = await Platform.findAll({
                where: { id: platformIds }
            });

            if (platforms.length !== platformIds.length) {
                return res.status(404).json({ message: 'One or more platforms not found' });
            }

            await Promise.all(
                platforms.map(async (platform) => {
                    await PlatformReview.create({
                        reviewId: newReview.id,
                        platformId: platform.id
                    });
                })
            );
        }

        const updatedReview = await Review.findByPk(newReview.id, {
            include: [
                { model: Genre, as: 'genres', through: { attributes: [] } },
                { model: Platform, as: 'platforms', through: { attributes: [] } },
                {
                    model: Section, as: 'sections', attributes: {
                        exclude: ['reviewId', 'review_id']
                    }
                }
            ],
            attributes: {
                exclude: ['publisher_id', 'developer_id', 'publisherId', 'developerId']
            }
        });

        return res.status(200).json(updatedReview);
    } catch (err) {
        console.error('Error adding new review:', err);
        return res.status(500).json({ message: 'An error occurred while adding the review.' });
    }
};

const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { gameTitle, gamePoster, gameReleaseDate, adminRating,
            developerId, publisherId, genreIds, platformIds } = req.body;

        if (
            !gameTitle && !gamePoster && !gameReleaseDate && !adminRating &&
            !developerId && !publisherId && !genreIds && !platformIds
        ) {
            return res.status(400).json({ message: 'At least one change is required.' });
        }

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ message: `Review with id ${id} not found` });
        }

        const fieldsToUpdate = {
            gameTitle,
            gamePoster,
            gameReleaseDate,
            adminRating,
            developerId,
            publisherId
        };

        Object.keys(fieldsToUpdate).forEach((field) => {
            if (fieldsToUpdate[field]) review[field] = fieldsToUpdate[field];
        });

        if (genreIds) {
            const existingGenres = await review.getGenres();

            const genresToRemove = existingGenres.filter(
                (genre) => !genreIds.includes(genre.id)
            );

            await Promise.all(
                genresToRemove.map(async (genre) => {
                    await review.removeGenre(genre);
                })
            );
            const genres = await Genre.findAll({ where: { id: genreIds } });

            if (genres.length !== genreIds.length) {
                return res.status(404).json({ message: 'One or more genres not found' });
            }

            await Promise.all(
                genres.map(async (genre) => {
                    await GenreReview.findOrCreate({
                        where: { reviewId: review.id, genreId: genre.id },
                        defaults: { reviewId: review.id, genreId: genre.id }
                    });
                })
            );
        }

        if (platformIds) {
            const existingPlatforms = await review.getPlatforms();

            const platformsToRemove = existingPlatforms.filter(
                (platform) => !platformIds.includes(platform.id)
            );

            await Promise.all(
                platformsToRemove.map(async (platform) => {
                    await review.removePlatform(platform);
                })
            );

            const platforms = await Platform.findAll({ where: { id: platformIds } });

            if (platforms.length !== platformIds.length) {
                return res.status(404).json({ message: 'One or more platforms not found' });
            }

            await Promise.all(
                platforms.map(async (platform) => {
                    await PlatformReview.findOrCreate({
                        where: { reviewId: review.id, platformId: platform.id },
                        defaults: { reviewId: review.id, platformId: platform.id }
                    });
                })
            );
        }

        await review.save();

        const updatedReview = await Review.findByPk(review.id, {
            include: [
                { model: Genre, as: 'genres', through: { attributes: [] } },
                { model: Platform, as: 'platforms', through: { attributes: [] } },
                {
                    model: Section, as: 'sections', attributes: {
                        exclude: ['reviewId', 'review_id']
                    }
                }
            ],
            attributes: {
                exclude: ['publisher_id', 'developer_id', 'publisherId', 'developerId']
            }
        });

        return res.status(200).json(updatedReview);
    } catch (err) {
        console.error(`Error updating review with id ${id}:`, err);
        return res.status(500).json({ message: 'An error occurred while updating the review.' });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ message: `Review with id ${id} not found` });
        }

        await review.destroy();

        return res.status(200).json({ message: `Review with id ${id} deleted successfully` });
    } catch (err) {
        console.error(`Error deleting review with id ${req.params.id}:`, err);
        return res.status(500).json({ message: 'An error occurred while deleting the review.' });
    }
};

module.exports = {
    getAllReviews,
    getReviewById,
    addReview,
    updateReview,
    deleteReview
}