const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');

const Genre = sequelize.define('Genre', {
    nameRu: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name_ru'
    },
    nameEn: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name_en'
    },
    nameUk: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name_uk'
    }
}, {
    tableName: 'genres',
    timestamps: false
});

module.exports = Genre;