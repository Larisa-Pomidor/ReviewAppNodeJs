const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');

const PlatformReview = sequelize.define('platform_reviews', {
  reviewId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Review', 
      key: 'id'
    },
    field: 'review_id', 
    primaryKey: true
  },
  platformId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Platform', 
      key: 'id'
    },
    field: 'platform_id',
    primaryKey: true
  }
}, {
  timestamps: false, 
  freezeTableName: true 
});

module.exports = PlatformReview;