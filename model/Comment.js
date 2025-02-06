const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');
const Developer = require('./Developer');
const Publisher = require('./Publisher');
const User = require('./User');
const Review = require('./Review');

const Comment = sequelize.define('Comment', {
    text: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    likes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    dislikes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    isDeleted: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: false,
        field: 'is_deleted'
    },
    parentCommentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'parent_comment_id'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    reviewId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'review_id',
        references: {
            model: Review,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    }
}, {
    tableName: 'comments',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false,
    defaultScope: {
        include: [
            {
                model: User,
                as: 'users',
                attributes: ['nickname', 'avatar', 'isBanned']
            }
        ]
    }
});

module.exports = Comment;