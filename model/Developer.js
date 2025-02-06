const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');

const Developer = sequelize.define('Developer', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'developers',
    timestamps: false
});

module.exports = Developer;