const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');

const Genre = sequelize.define('Genre', {
    name_ru: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name_en: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name_uk: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'genres',
    timestamps: false
});

module.exports = Genre;