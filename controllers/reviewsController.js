const { Op } = require("sequelize");
const { Sequelize } = require('sequelize');

const GenreReview = require('../model/GenresReview');
const PlatformReview = require('../model/PlatformReview');
const Platform = require('../model/Platform');
const Genre = require('../model/Genre');
const Review = require('../model/Review');
const Publisher = require('../model/Publisher');
const Developer = require('../model/Developer');
const Section = require('../model/Section');

const uploadImages = require("../middleware/uploadImagesCloudinary");
const uploadFileToStorage = require("../middleware/uploadImagesToStorage");
const ReviewUser = require("../model/ReviewUser");
const User = require("../model/User");

const getAllReviews = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        let reviewsQuery = {
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
                    attributes: { exclude: ['reviewId', 'review_id'] }
                }
            ],
            attributes: {
                exclude: ['publisher_id', 'developer_id', 'publisherId', 'developerId']
            }
        };

        let totalReviews = await Review.count();

        if (!isNaN(limitNumber)) {
            reviewsQuery.limit = limitNumber;
        }

        if (!isNaN(limitNumber) && !isNaN(pageNumber)) {
            reviewsQuery.offset = (pageNumber - 1) * limitNumber;
        }

        const reviews = await Review.findAll(reviewsQuery);

        if (reviews.length === 0) {
            return res.status(204).json({ message: 'No reviews found' });
        }

        return res.status(200).json({
            totalReviews,
            totalPages: pageNumber && limitNumber ? Math.ceil(totalReviews / limitNumber) : 1,
            currentPage: pageNumber || 1,
            data: reviews
        });

    } catch (err) {
        console.error('Error retrieving reviews:', err);
        return res.status(500).json({ message: 'An unexpected error occurred while retrieving reviews.' });
    }
};

const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const username = req.user || '1';

        const attributes = {
            exclude: ['publisher_id', 'developer_id', 'publisherId', 'developerId'],
            include: [
                [Sequelize.fn('COUNT', Sequelize.col('reviewUsers.id')), 'userCount']
            ]
        };

        if (username) {
            attributes.include.push([
                Sequelize.literal(`
                    EXISTS (SELECT 1 FROM "review_users" INNER JOIN "users" 
                    ON "users"."id" = "review_users"."user_id"
                    WHERE "review_users"."review_id" = ${id} 
                    AND "users"."username" = '${username}')
                `),
                'isUserInReview'
            ]);
        }

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
                },
                {
                    model: User,
                    as: 'reviewUsers',
                    attributes: [],
                    through: { attributes: [] }
                }
            ],
            attributes,
            group: ['Review.id', 'developer.id', 'publisher.id', 'genres.id', 'platforms.id', 'sections.id']
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

const getDLCsbyReviewId = async (req, res) => {
    const { id } = req.params;

    try {
        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ message: `Review with id ${id} not found` });
        }

        const currentDlcParent = !review.dlcParentId ? review : await Review.findByPk(review.dlcParentId);

        if (!currentDlcParent) {
            return res.status(404).json({ message: 'No DLC parent found' });
        }

        let DLCs = await Review.findAll({
            where: { dlcParentId: currentDlcParent.id },
            attributes: {
                exclude: ['publisher_id', 'developer_id', 'publisherId', 'developerId']
            },
            include: [
                { model: Developer, as: "developer" },
                { model: Publisher, as: "publisher" },
                { model: Genre, as: "genres", through: { attributes: [] } },
                { model: Platform, as: "platforms", through: { attributes: [] } }
            ],
        });


        if (DLCs.length === 0) {
            return res.status(204).json({ message: 'No DLCs found' }); // No Content
        }

        if (review.dlcParentId) {
            DLCs = [currentDlcParent, ...DLCs];
        }

        return res.status(200).json(DLCs);
    } catch (err) {
        console.error('Error retrieving DLCs:', err);
        return res.status(500).json({ message: 'An unexpected error occurred while retrieving DLCs.' });
    }
};

const getReviewHierarchy = async (req, res) => {
    const { id } = req.params;

    try {
        let review = await Review.findByPk(id, {
            attributes: {
                exclude: ['publisher_id', 'developer_id', 'publisherId', 'developerId']
            },
            include: [
                { model: Developer, as: "developer" },
                { model: Publisher, as: "publisher" },
                { model: Genre, as: "genres", through: { attributes: [] } },
                { model: Platform, as: "platforms", through: { attributes: [] } }
            ],
        });

        if (!review) {
            return res.status(404).json({ message: `Review with id ${id} not found` });
        }

        let parentReviews = [];
        let currentParentId = review.reviewParentId;

        while (currentParentId) {
            const parent = await Review.findByPk(currentParentId, {
                attributes: {
                    exclude: ['publisher_id', 'developer_id', 'publisherId', 'developerId']
                },
                include: [
                    { model: Developer, as: "developer" },
                    { model: Publisher, as: "publisher" },
                    { model: Genre, as: "genres", through: { attributes: [] } },
                    { model: Platform, as: "platforms", through: { attributes: [] } }
                ],
            });

            if (!parent) break;

            parentReviews.unshift(parent);
            currentParentId = parent.reviewParentId;
        }

        let childReviews = [];
        let currentChildId = id;

        while (true) {
            const child = await Review.findOne({
                where: { reviewParentId: currentChildId },
                attributes: {
                    exclude: ['publisher_id', 'developer_id', 'publisherId', 'developerId']
                },
                include: [
                    { model: Developer, as: "developer" },
                    { model: Publisher, as: "publisher" },
                    { model: Genre, as: "genres", through: { attributes: [] } },
                    { model: Platform, as: "platforms", through: { attributes: [] } }
                ],
            });

            if (!child) break;

            childReviews.push(child);
            currentChildId = child.id;
        }

        const reviewHierarchy = [...parentReviews, ...childReviews];

        if (reviewHierarchy === 0) {
            return res.status(204).json({ message: 'No hierarchy found' }); // No Content
        }

        return res.status(200).json(reviewHierarchy);
    } catch (err) {
        console.error('Error retrieving review hierarchy:', err);
        return res.status(500).json({ message: 'An unexpected error occurred while retrieving reviews.' });
    }
};

const getReviewsByGenres = async (req, res) => {
    const { id } = req.params;

    let { limit } = req.query;
    limit = parseInt(limit) || 10;

    if (limit < 1) {
        return res.status(400).json({ message: "Limit must be at least 1." });
    }

    try {
        const review = await Review.findByPk(id, {
            include: [{ model: Genre, as: "genres", attributes: ["id", "name_ru", "name_en", "name_uk"] }]
        });

        if (!review) {
            return res.status(404).json({ message: `Review with id ${id} not found` });
        }

        const genreIds = review.genres.map(g => g.id);

        if (genreIds.length === 0) {
            return res.status(204).json({ message: 'No genres included' });
        }

        const similarReviews = await Review.findAll({
            where: {
                id: { [Op.ne]: id },
            },
            include: [
                {
                    model: Genre,
                    as: "genres",
                    where: {
                        id: { [Op.in]: genreIds },
                    },
                    through: { attributes: [] }
                },
                { model: Developer, as: "developer" },
                { model: Publisher, as: "publisher" },
                { model: Platform, as: "platforms", through: { attributes: [] } }
            ],
            attributes: {
                exclude: ['publisher_id', 'developer_id', 'publisherId', 'developerId']
            },
            limit: limit
        });

        return res.status(200).json(similarReviews);
    } catch (err) {
        console.error('Error retrieving similar reviews:', err);
        return res.status(500).json({ message: 'An unexpected error occurred while retrieving similar reviews.' });
    }
};

const addReview = async (req, res) => {
    uploadImages(req, res, async (err) => {
        if (err) return res.status(400).json({ error: "Multer error" });

        try {
            const { gameTitle, gameReleaseDate, adminRating, developerId,
                publisherId, reviewParentId, dlcParentId } = req.body;

            let { genreIds, platformIds } = req.body;

            const gamePosterFile = req.files.find(file => file.fieldname === 'gamePoster');
            const gameThumbnailFile = req.files.find(file => file.fieldname === 'gameThumbnail');

            if (!gameTitle || !gamePosterFile || !gameThumbnailFile || !gameReleaseDate
                || !adminRating || !developerId || !publisherId) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const developer = await Developer.findByPk(developerId);
            if (!developer) return res.status(404).json({ message: `Developer with id ${developerId} not found` });

            const publisher = await Publisher.findByPk(publisherId);
            if (!publisher) return res.status(404).json({ message: `Publisher with id ${publisherId} not found` });

            const fileExtensionPoster = gamePosterFile.mimetype.split("/")[1];
            const fileNamePoster = `gamePoster-${Date.now()}.${fileExtensionPoster}`;

            const gamePosterUrl = await uploadFileToStorage(
                gamePosterFile.buffer,
                fileNamePoster,
                "gamePosters",
                gamePosterFile.mimetype
            );

            const fileExtensionThumbnail = gameThumbnailFile.mimetype.split("/")[1];
            const fileNameThumbnail = `gameThumbnail-${Date.now()}.${fileExtensionThumbnail}`;

            const gameThumbnailUrl = await uploadFileToStorage(
                gameThumbnailFile.buffer,
                fileNameThumbnail,
                "gameThumbnails",
                gameThumbnailFile.mimetype
            );

            const newReview = await Review.create({
                gameTitle,
                gamePoster: gamePosterUrl,
                gameThumbnail: gameThumbnailUrl,
                gameReleaseDate,
                adminRating,
                developerId,
                publisherId,
                ...(reviewParentId && { reviewParentId }),
                ...(dlcParentId && { dlcParentId }),
                views: 0
            });

            if (genreIds && genreIds.length > 0) {
                genreIds = genreIds.split(",").map(Number);
                const genres = await Genre.findAll({ where: { id: genreIds } });
                if (genres.length !== genreIds.length) return res.status(404).json({ message: "One or more genres not found" });

                await Promise.all(
                    genres.map(async (genre) => {
                        await GenreReview.create({ reviewId: newReview.id, genreId: genre.id });
                    })
                );
            }

            if (platformIds && platformIds.length > 0) {
                platformIds = platformIds.split(",").map(Number);
                const platforms = await Platform.findAll({ where: { id: platformIds } });
                if (platforms.length !== platformIds.length) return res.status(404).json({ message: "One or more platforms not found" });

                await Promise.all(
                    platforms.map(async (platform) => {
                        await PlatformReview.create({ reviewId: newReview.id, platformId: platform.id });
                    })
                );
            }

            const updatedReview = await Review.findByPk(newReview.id, {
                include: [
                    { model: Genre, as: "genres", through: { attributes: [] } },
                    { model: Platform, as: "platforms", through: { attributes: [] } }
                ],
                attributes: { exclude: ["publisher_id", "developer_id", "publisherId", "developerId"] }
            });

            return res.status(200).json(updatedReview);
        } catch (error) {
            console.error("Error adding new review:", error);
            return res.status(500).json({ message: "An error occurred while adding the review." });
        }
    });
};

const updateReview = async (req, res) => {
    uploadImages(req, res, async (err) => {
        if (err) return res.status(400).json({ error: "Multer error" });

        const { id } = req.params;

        try {
            const { gameTitle, gameReleaseDate, adminRating,
                developerId, publisherId } = req.body;

            let { reviewParentId, dlcParentId } = req.body;

            if (reviewParentId === "null") reviewParentId = null;
            if (dlcParentId === "null") dlcParentId = null;

            let { genreIds, platformIds } = req.body;

            const gamePosterFile = req.files.find(file => file.fieldname === 'gamePoster');
            const gameThumbnailFile = req.files.find(file => file.fieldname === 'gameThumbnail');

            if (!gameTitle && !gamePosterFile && !gameThumbnailFile && !reviewParentId && !dlcParentId &&
                !gameReleaseDate && !adminRating && !developerId && !publisherId && !genreIds && !platformIds
            ) {
                return res.status(400).json({ message: 'At least one change is required.' });
            }

            const review = await Review.findByPk(id);

            if (!review) {
                return res.status(404).json({ message: `Review with id ${id} not found` });
            }

            let gamePosterUrl;

            if (gamePosterFile) {
                const fileExtensionPoster = gamePosterFile.mimetype.split("/")[1];
                const fileNamePoster = `gamePoster-${Date.now()}.${fileExtensionPoster}`;

                gamePosterUrl = await uploadFileToStorage(
                    gamePosterFile.buffer,
                    fileNamePoster,
                    "gamePosters",
                    gamePosterFile.mimetype
                );
            }

            let gameThumbnailUrl;

            if (gameThumbnailFile) {
                const fileExtensionThumbnail = gameThumbnailFile.mimetype.split("/")[1];
                const fileNameThumbnail = `gameThumbnail-${Date.now()}.${fileExtensionThumbnail}`;

                gameThumbnailUrl = await uploadFileToStorage(
                    gameThumbnailFile.buffer,
                    fileNameThumbnail,
                    "gameThumbnails",
                    gameThumbnailFile.mimetype
                );
            }

            if (gameTitle) review.gameTitle = gameTitle;
            if (gameReleaseDate) review.gameReleaseDate = gameReleaseDate;
            if (adminRating) review.adminRating = adminRating;
            if (developerId) review.developerId = developerId;
            if (publisherId) review.publisherId = publisherId;
            if (gamePosterFile) review.gamePoster = gamePosterUrl;
            if (gameThumbnailFile) review.gameThumbnail = gameThumbnailUrl;
            if (reviewParentId !== undefined) review.reviewParentId = reviewParentId;
            if (dlcParentId !== undefined) review.dlcParentId = dlcParentId;

            if (genreIds) {

                genreIds = genreIds.split(",").map(Number);
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
                platformIds = platformIds.split(",").map(Number);
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
    });
};

const updateViews = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ message: `Review with id ${id} not found` });
        }

        review.views = Number(review.views) + 1;

        await review.save();

        return res.status(200).json(review.views);
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

        const platformReview = await PlatformReview.findAll({ where: { reviewId: id } });
        await Promise.all(
            platformReview.map(async (item) => {
                await item.destroy();
            })
        );

        const genresReview = await GenreReview.findAll({ where: { reviewId: id } });
        await Promise.all(
            genresReview.map(async (item) => {
                await item.destroy();
            })
        );

        const sections = await Section.findAll({ where: { reviewId: id } });
        await Promise.all(
            sections.map(async (item) => {
                await item.destroy();
            })
        );

        await review.destroy();

        return res.status(200).json({ message: `Review with id ${id} deleted successfully` });
    } catch (err) {
        console.error(`Error deleting review with id ${req.params.id}:`, err);
        return res.status(500).json({ message: 'An error occurred while deleting the review.' });
    }
};

const rateReview = async (req, res) => {
    try {

        const username = req.user || '1';
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ 'message': `User is not found` });
        }

        const { id } = req.params;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ message: `Review with id ${id} not found` });
        }

        const reviewUser = await ReviewUser.findOne({ where: { review_id: id, user_id: user.id } });

        !reviewUser ? await ReviewUser.create({ review_id: id, user_id: user.id }) : await reviewUser.destroy();

        return res.status(200).json(!reviewUser ? true : false);
    } catch (err) {
        console.error(`Error deleting reviewUser with id ${req.params.id}:`, err);
        return res.status(500).json({ message: 'An error occurred while deleting the review.' });
    }
};

module.exports = {
    getAllReviews,
    getReviewById,
    addReview,
    updateReview,
    deleteReview,
    getDLCsbyReviewId,
    getReviewHierarchy,
    getReviewsByGenres,
    updateViews,
    rateReview
}