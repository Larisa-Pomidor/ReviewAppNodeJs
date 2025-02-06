const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');
const Developer = require('./Developer');
const Publisher = require('./Publisher');

const Review = sequelize.define('Review', {
    gameTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'game_title'
    },
    gamePoster: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'game_poster'
    },
    gameReleaseDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'game_release_date'
    },
    adminRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'rating'
    },
    developerId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Developer, 
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        field: 'developer_id'
    },
    publisherId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Publisher, 
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        field: 'publisher_id'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at'
    },
    editedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'edited_at'
    }
}, {
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'editedAt'
});

module.exports = Review;