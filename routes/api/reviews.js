const express = require('express');
const router = express.Router();
const reviewsController = require('../../controllers/reviewsController');
const sectionsController = require('../../controllers/sectionsController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const verifyJWT = require('../../middleware/verifyJWT');
const optionalJWT = require('../../middleware/optionalJWT');

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews
  *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page number (if omitted, returns all reviews)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of items per page (if omitted, returns all reviews)
 *     responses:
 *       200:
 *         description: Reviews details
 *       204:
 *         description: No reviews found
 *       500:
 *         description: An unexpected error occurred while retrieving the reviews.
 *   post:
 *     summary: Add a new review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameTitle
 *               - gamePoster
 *               - gameReleaseDate
 *               - adminRating
 *               - developerId
 *               - publisherId
 *             properties:
 *               gameTitle:
 *                 type: string
 *                 description: Title of the game
 *               gamePoster:
 *                 type: string
 *                 format: uri
 *                 description: URL of the game poster
 *               gameReleaseDate:
 *                 type: string
 *                 format: date
 *                 description: Release date of the game
 *               adminRating:
 *                 type: number
 *                 format: float
 *                 description: Rating given by the admin
 *               developerId:
 *                 type: integer
 *                 description: ID of the developer
 *               publisherId:
 *                 type: integer
 *                 description: ID of the publisher
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: List of genre IDs
 *               platformIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: List of platform IDs
 *     responses:
 *       200:
 *         description: Review created successfully
 *       400:
 *         description: Invalid input, missing required fields
 *       404:
 *         description: Developer with {developerId} not found / Publisher with {publisherId} not found / Provided genres are not found / Provided platforms are not found.
 *       500:
 *         description: An unexpected error occurred while creating the review.
 */
router.route('/')
    .get(
        reviewsController.getAllReviews)
    .post(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        reviewsController.addReview)

/**
* @swagger
* /reviews/{id}:
*   get:
*     summary: Get a review by ID
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*     responses:
*       200:
*         description: Review details
*       404:
*          description: Review or related resource not found.
*       500:
*         description: An unexpected error occurred while retrieving the review.
*   put:
*     summary: Update the review
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               gameTitle:
*                 type: string
*                 description: Title of the game
*               gamePoster:
*                 type: string
*                 format: uri
*                 description: URL of the game poster
*               gameReleaseDate:
*                 type: string
*                 format: date
*                 description: Release date of the game
*               adminRating:
*                 type: number
*                 format: float
*                 description: Rating given by the admin
*               developerId:
*                 type: integer
*                 description: ID of the developer
*               publisherId:
*                 type: integer
*                 description: ID of the publisher
*               genreIds:
*                 type: array
*                 items:
*                   type: integer
*                 description: List of genre IDs
*               platformIds:
*                 type: array
*                 items:
*                   type: integer
*                 description: List of platform IDs
*             minProperties: 1
*     responses:
*       200:
*         description: Review updated successfully
*       400:
*         description: Invalid input, missing required fields
*       404:
*         description: Review with {id} not found / Provided genres are not found / Provided platforms are not found
*       500:
*         description: An unexpected error occurred while updating the review.
*   delete:
*     summary: Delete the review
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*     responses:
*       200:
*         description: Review deleted successfully
*       404:
*         description: Review with id {id} not found
*       500:
*         description: An unexpected error occurred while deleting the review.
*/
router.route('/:id')
    .get(optionalJWT,
        reviewsController.getReviewById)
    .delete(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        reviewsController.deleteReview)
    .put(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        reviewsController.updateReview);

router.route('/:id/sections')
    .post(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        sectionsController.addSection)

/**
* @swagger
* /reviews/{id}/dlcs:
*   get:
*     summary: Get DLCs by review ID
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*     responses:
*       200:
*         description: DLCs details
*       204:
*         description: No DLCs found
*       404:
*          description: Review with {id} not found / No DLC parent found
*       500:
*         description: An unexpected error occurred while retrieving DLCs.
*/
router.route('/:id/dlcs')
    .get(reviewsController.getDLCsbyReviewId)

/**
* @swagger
* /reviews/{id}/hierarchy:
*   get:
*     summary: Get hierarchy by review ID
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*     responses:
*       200:
*         description: Hierarchy details
*       204:
*         description: No hierarchy found
*       404:
*          description: Review with {id} not found
*       500:
*         description: An unexpected error occurred while retrieving hierarchy.
*/
router.route('/:id/hierarchy')
    .get(reviewsController.getReviewHierarchy)

/**
* @swagger
* /reviews/{id}/genres:
*   get:
*     summary: Get related reviews by genres
*     parameters:
*       - in: path
*         name: id
*         required: true
*       - in: query
*         name: limit
*         required: false
*         schema:
*           type: integer
*     responses:
*       200:
*         description: Reviews details
*       204:
*         description: No related reviews found
*       400:
*          description: Limit must be at least 1
*       404:
*          description: Review with {id} not found
*       500:
*         description: An unexpected error occurred while retrieving reviews by genres.
*/
router.route('/:id/genres')
    .get(reviewsController.getReviewsByGenres)

router.route('/:id/views')
    .put(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        reviewsController.updateViews)

router.route('/:id/rate')
    .put(verifyJWT,
        reviewsController.rateReview)

module.exports = router;