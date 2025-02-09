const express = require('express');
const router = express.Router();
const commentsController = require('../../controllers/commentsController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

/**
* @swagger
* /comments/{id}:
*   get:
*     summary: Get all comments by review ID
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*     responses:
*       200:
*         description: Comments details
*       500:
*         description: An unexpected error occurred while retrieving the comments.
*   post:
*     summary: Add a new comment by review id
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
*             required:
*               - text
*             properties:
*               text:
*                 type: string
*                 description: The comment text
*     responses:
*       200:
*         description: Comment created successfully
*       400:
*         description: Invalid input, missing required fields
*       404:
*         description: Review with {id} not found
*       500:
*         description: An unexpected error occurred while creating the comment.
*   delete:
*     summary: Change comment visibility by comment ID
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*     responses:
*       200:
*         description: Comment visibility changed successfully
*       404:
*         description: Comments with {id} not found
*       500:
*         description: An unexpected error occurred while changing the comment visibility.
*/
router.route('/:id')
    .get(commentsController.getAllCommentsByReviewId)
    .post(commentsController.addCommentByReviewId)
    .delete(commentsController.banCommentById)

module.exports = router;