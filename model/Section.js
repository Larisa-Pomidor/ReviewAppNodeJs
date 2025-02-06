const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');
const Review = require('./Review');

const Section = sequelize.define('Section', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    reviewId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Review, 
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        field: 'review_id'
    },
}, {
    tableName: 'sections',
    timestamps: false
});

module.exports = Section;