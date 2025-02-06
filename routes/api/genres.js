const express = require('express');
const router = express.Router();
const genresController = require('../../controllers/genresController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(genresController.getAllGenres)
    .post(genresController.addGenre)

router.route('/:id')
    .get(genresController.getGenreById)
    .delete(genresController.deleteGenre)
    .put(genresController.updateGenre);

module.exports = router;