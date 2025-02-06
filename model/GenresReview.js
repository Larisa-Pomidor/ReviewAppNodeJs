const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConn');

const GenreReview = sequelize.define('genre_reviews', {
  reviewId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Review', 
      key: 'id'
    },
    field: 'review_id', 
    primaryKey: true
  },
  genreId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Genre', 
      key: 'id',
    },
    field: 'genre_id',
    primaryKey: true
  }
}, {
  timestamps: false, 
  freezeTableName: true 
});

module.exports = GenreReview;