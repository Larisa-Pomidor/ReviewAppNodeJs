const { Sequelize } = require('sequelize');
const Comment = require('../model/Comment');
const Review = require('../model/Review');
const User = require('../model/User');
const CommentUser = require('../model/CommentUser');

const getAllCommentsByReviewId = async (req, res) => {
    try {
        const username = req.user || '1'; // Ensure username is properly accessed
        const { id } = req.params;

        const comments = await Comment.findAll({
            where: {
                reviewId: id,
                parentCommentId: null
            },
            include: [
                {
                    model: Comment,
                    as: "replies",
                    required: false,
                    attributes: {
                        exclude: ['parent_comment_id', 'parentCommentId'],
                        include: [
                            [
                                Sequelize.literal(`
                                    (SELECT COUNT(*) FROM "comment_users"
                                     WHERE "comment_users"."comment_id" = "replies"."id"
                                     AND "comment_users"."rating" = true)
                                `),
                                'likesCount'
                            ],
                            [
                                Sequelize.literal(`
                                    (SELECT COUNT(*) FROM "comment_users"
                                     WHERE "comment_users"."comment_id" = "replies"."id"
                                     AND "comment_users"."rating" = false)
                                `),
                                'dislikesCount'
                            ],
                            ...(username
                                ? [
                                    [
                                        Sequelize.literal(`
                                            (
                                                SELECT "comment_users"."rating"
                                                FROM "comment_users"
                                                INNER JOIN "users" ON "users"."id" = "comment_users"."user_id"
                                                WHERE "comment_users"."comment_id" = "replies"."id"
                                                AND "users"."username" = '${username}'
                                                LIMIT 1
                                            )
                                        `),
                                        'userCommentRating'
                                    ]
                                ]
                                : [])
                        ]
                    }
                }
            ],
            attributes: {
                exclude: ['parent_comment_id', 'parentCommentId'],
                include: [
                    [
                        Sequelize.literal(`
                            (SELECT COUNT(*) FROM "comment_users"
                             WHERE "comment_users"."comment_id" = "Comment"."id"
                             AND "comment_users"."rating" = true)
                        `),
                        'likesCount'
                    ],
                    [
                        Sequelize.literal(`
                            (SELECT COUNT(*) FROM "comment_users"
                             WHERE "comment_users"."comment_id" = "Comment"."id"
                             AND "comment_users"."rating" = false)
                        `),
                        'dislikesCount'
                    ],
                    ...(username
                        ? [
                            [
                                Sequelize.literal(`
                                    (
                                        SELECT "comment_users"."rating"
                                        FROM "comment_users"
                                        INNER JOIN "users" ON "users"."id" = "comment_users"."user_id"
                                        WHERE "comment_users"."comment_id" = "Comment"."id"
                                        AND "users"."username" = '${username}'
                                        LIMIT 1
                                    )
                                `),
                                'userCommentRating'
                            ]
                        ]
                        : [])
                ]
            }
        });

        return res.status(200).json(comments);
    } catch (err) {
        console.error('Error retrieving comments:', err);
        return res.status(500).json({ message: 'An unexpected error occurred while retrieving comments.' });
    }
};


const addCommentByReviewId = async (req, res) => {
    try {

        const username = req.user;
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ 'message': `User is not found` });
        }

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
            userId: user.id,
            reviewId: review.id,
            ...(parentCommentId && { parentCommentId })
        });

        const createdComment = await Comment.findByPk(
            newComment.id
        );

        return res.status(200).json({
            ...createdComment.get({ plain: true }),
            likesCount: 0,
            dislikesCount: 0,
        });

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

const likeComment = async (req, res) => {
    try {
        const username = req.user || '1';
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ 'message': `User is not found` });
        }

        const { id } = req.params;

        const comment = await Comment.findByPk(id);

        if (!comment) {
            return res.status(404).json({ message: `Comment with id ${id} not found` });
        }

        const commentUser = await CommentUser.findOne({ where: { user_id: user.id, comment_id: id } });

        if (!commentUser)
            await CommentUser.create({ comment_id: id, user_id: user.id, rating: true })
        else if (commentUser.rating !== true) {
            commentUser.rating = true;
            commentUser.save();
        }
        else {
            commentUser.destroy();
        }

        return res.status(200).json(!commentUser ? true : false);
    } catch (err) {
        console.error(`Error rating comment with id ${req.params.id}:`, err);
        return res.status(500).json({ message: 'An error occurred while rating the comment.' });
    }
};

const dislikeComment = async (req, res) => {
    try {
        const username = req.user || '1';
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ 'message': `User is not found` });
        }

        const { id } = req.params;

        const comment = await Comment.findByPk(id);

        if (!comment) {
            return res.status(404).json({ message: `Comment with id ${id} not found` });
        }

        const commentUser = await CommentUser.findOne({ where: { user_id: user.id, comment_id: id } });

        if (!commentUser)
            await CommentUser.create({ comment_id: id, user_id: user.id, rating: false })
        else if (commentUser.rating !== false) {
            commentUser.rating = false;
            commentUser.save();
        }
        else {
            commentUser.destroy();
        }

        return res.status(200).json(!commentUser ? true : false);
    } catch (err) {
        console.error(`Error rating comment with id ${req.params.id}:`, err);
        return res.status(500).json({ message: 'An error occurred while rating the comment.' });
    }
};

module.exports = {
    getAllCommentsByReviewId,
    addCommentByReviewId,
    banCommentById,
    likeComment,
    dislikeComment
}