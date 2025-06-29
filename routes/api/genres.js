const express = require('express');
const router = express.Router();
const genresController = require('../../controllers/genresController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const verifyJWT = require('../../middleware/verifyJWT');

router.route('/')
    .get(genresController.getAllGenres)
    .post(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        genresController.addGenre)

router.route('/:id')
    .get(genresController.getGenreById)
    .delete(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        genresController.deleteGenre)
    .put(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        genresController.updateGenre);

module.exports = router;