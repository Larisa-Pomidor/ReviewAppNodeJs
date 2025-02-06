const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    roles: {
        type: DataTypes.JSONB,
        defaultValue: {
            User: 2001,
            Admin: null
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    refreshToken: {
        type: DataTypes.STRING,
        field: 'refresh_token'
    },
    isBanned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_banned'
    }
}, {
    tableName: 'users',
    timestamps: true,
});

module.exports = User;