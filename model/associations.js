const Review = require('./Review');
const Publisher = require('./Publisher');
const Developer = require('./Developer');
const Genre = require('./Genre');
const Platform = require('./Platform');
const PlatformReview = require('./PlatformReview');
const GenreReview = require('./GenresReview');
const Section = require('./Section');
const User = require('./User');
const Comment = require('./Comment');

Publisher.hasMany(Review, { foreignKey: 'publisher_id', as: 'reviews' });
Review.belongsTo(Publisher, { foreignKey: 'publisher_id', as: 'publisher' });

Developer.hasMany(Review, { foreignKey: 'developer_id', as: 'reviews' });
Review.belongsTo(Developer, { foreignKey: 'developer_id', as: 'developer' });

Review.hasMany(Section, { foreignKey: 'review_id', as: 'sections' });
Section.belongsTo(Review, { foreignKey: 'review_id', as: 'reviews' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'users' });

Review.hasMany(Comment, { foreignKey: 'review_id', as: 'comments' });
Comment.belongsTo(Review, { foreignKey: 'review_id', as: 'reviews' });

Review.belongsToMany(Genre, {
    through: GenreReview,
    foreignKey: 'review_id',
    otherKey: 'genre_id',
    as: 'genres'
});

Genre.belongsToMany(Review, {
    through: GenreReview,
    foreignKey: 'genre_id',
    otherKey: 'review_id',
    as: 'reviews'
});

Review.belongsToMany(Platform, {
    through: PlatformReview,
    foreignKey: 'review_id',
    otherKey: 'platform_id',
    as: 'platforms'
});

Platform.belongsToMany(Review, {
    through: PlatformReview,
    foreignKey: 'platform_id',
    otherKey: 'review_id',
    as: 'reviews'
});

Comment.hasMany(Comment, {
    as: "replies",
    foreignKey: "parent_comment_id",
    onDelete: "CASCADE"
});

Comment.belongsTo(Comment, {
    as: "parent",
    foreignKey: "parent_comment_id"
});

module.exports = { Review, Publisher, Developer, Genre };