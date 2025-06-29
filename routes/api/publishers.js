const express = require('express');
const router = express.Router();
const publishersController = require('../../controllers/publishersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const verifyJWT = require('../../middleware/verifyJWT');

router.route('/')
    .get(publishersController.getAllPublishers)
    .post(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        publishersController.addPublisher)

router.route('/:id')
    .get(publishersController.getPublisherById)
    .delete(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        publishersController.deletePublisher)
    .put(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        publishersController.updatePublisher);

module.exports = router;