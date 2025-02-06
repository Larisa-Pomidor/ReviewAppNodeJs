const Comment = require('../model/Comment');
const Review = require('../model/Review');

const getAllCommentsByReviewId = async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: {
                reviewId: req.params.id,
                parentCommentId: null
            },
            include: [
                {
                    model: Comment,
                    as: "replies",
                    required: false,
                    attributes: {
                        exclude: ['parent_comment_id', 'parentCommentId']
                    }
                }
            ],
            attributes: {
                exclude: ['parent_comment_id', 'parentCommentId']
            }
        });

        return res.status(200).json(comments);
    } catch (err) {
        console.error('Error retrieving comment:', err);
        return res.status(500).json({ message: 'An unexpected error occurred while retrieving comments.' });
    }
};

const addCommentByReviewId = async (req, res) => {
    try {
        const userId = 2;
        const { id } = req.params;
        const { parentCommentId, text } = req.body;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ message: `Review with id ${id} not found` });
        }

        if (!text) {
            return res.status(400)
                .json({ message: 'Missing required fields: text.' });
        }

        const newComment = await Comment.create({
            text,
            userId: userId,
            reviewId: review.id,
            ...(parentCommentId && { parentCommentId })
        });

        const createdComment = await Comment.findByPk(
            newComment.id,
            {
                attributes: {
                    exclude: ['parent_comment_id', 'parentCommentId']
                }
            });

        return res.status(200).json(createdComment);
    } catch (err) {
        console.error('Error adding new comment:', err);
        return res.status(500).json({ message: 'An error occurred while adding the comment.' });
    }
};

const banCommentById = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findByPk(id);

        if (!comment) {
            return res.status(404).json({ message: `Comment with id ${id} not found` });
        }

        comment.isDeleted = !comment.isDeleted;

        await comment.save();

        return res.status(200).json(comment);
    } catch (err) {
        console.error('Error banning / unbanning the comment:', err);
        return res.status(500).json({ message: 'An error occurred while banning / unbanning the comment.' });
    }
};

module.exports = {
    getAllCommentsByReviewId,
    addCommentByReviewId,
    banCommentById
}