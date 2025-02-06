const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');

const Platform = sequelize.define('Platform', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'platforms',
    timestamps: false
});

module.exports = Platform;