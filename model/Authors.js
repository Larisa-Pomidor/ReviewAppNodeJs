const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');
const Songs = require('./Songs');

const Authors = sequelize.define('authors', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'authors',
    timestamps: true,
    createdAt: false,
    updatedAt: false
});

module.exports = Authors;