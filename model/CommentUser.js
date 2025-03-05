const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');

const CommentUser = sequelize.define('comment_users', {
  reviewId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Comment', 
      key: 'id'
    },
    field: 'comment_id', 
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'User', 
      key: 'id'
    },
    field: 'user_id',
    primaryKey: true
  },
  rating: {
    type: DataTypes.BOOLEAN,    
    field: 'rating',
    allowNull: false,
  }
}, {
  timestamps: false, 
  freezeTableName: true 
});

module.exports = CommentUser;