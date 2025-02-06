const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');

const Publisher = sequelize.define('Publisher', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'publishers',
    timestamps: false
});

module.exports = Publisher;