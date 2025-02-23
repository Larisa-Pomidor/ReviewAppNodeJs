const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');
const Review = require('./Review');

const Section = sequelize.define('Section', {
    nameRu: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name_ru'
    },
    textRu: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'text_ru'
    },
    nameEn: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name_en'
    },
    textEn: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'text_en'
    },  
    nameUk: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name_uk'
    },
    textUk: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'text_uk'
    },  
    image: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    isSummary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'is_summary'
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