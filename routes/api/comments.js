const express = require('express');
const router = express.Router();
const commentsController = require('../../controllers/commentsController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');


router.route('/:id')
    .get(commentsController.getAllCommentsByReviewId)
    .post(commentsController.addCommentByReviewId)
    .delete(commentsController.banCommentById)

module.exports = router;