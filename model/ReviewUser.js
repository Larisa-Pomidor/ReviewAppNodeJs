const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');

const ReviewUser = sequelize.define('review_users', {
  reviewId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Review', 
      key: 'id'
    },
    field: 'review_id', 
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
  }
}, {
  timestamps: false, 
  freezeTableName: true 
});

module.exports = ReviewUser;