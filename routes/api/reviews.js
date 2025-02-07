const express = require('express');
const router = express.Router();
const reviewsController = require('../../controllers/reviewsController');
const sectionsController = require('../../controllers/sectionsController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(reviewsController.getAllReviews)
    .post(reviewsController.addReview)

router.route('/:id')
    .get(reviewsController.getReviewById)
    .delete(reviewsController.deleteReview)
    .put(reviewsController.updateReview);

router.route('/:reviewId/sections/:sectionId')
    .get(sectionsController.updateSection)

router.route('/:id/dlcs')
    .get(reviewsController.getDLCsbyReviewId)

module.exports = router;