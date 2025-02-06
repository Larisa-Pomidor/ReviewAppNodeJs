const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');

const User = sequelize.define('user', {
    username: {
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
    refreshToken: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'user',
    timestamps: true,
});

// sequelize.sync()
//     .then(() => console.log('User model synced with the database'))
//     .catch((err) => console.error('Error syncing model:', err));

module.exports = User;