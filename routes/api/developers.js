const express = require('express');
const router = express.Router();
const developersController = require('../../controllers/developersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const verifyJWT = require('../../middleware/verifyJWT');

router.route('/')
    .get(developersController.getAllDevelopers)
    .post(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        developersController.addDeveloper)

router.route('/:id')
    .get(developersController.getDeveloperById)
    .delete(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        developersController.deleteDeveloper)
    .put(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        developersController.updateDeveloper);

module.exports = router;