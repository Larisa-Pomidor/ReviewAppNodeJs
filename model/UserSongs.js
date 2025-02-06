const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');
const User = require('./User');
const Songs = require('./Songs');

const UserSongs = sequelize.define('user_songs', {
    song_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Songs,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'user_songs',
    timestamps: false
});

module.exports = UserSongs;