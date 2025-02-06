const express = require('express');
const router = express.Router();
const publishersController = require('../../controllers/publishersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(publishersController.getAllPublishers)
    .post(publishersController.addPublisher)

router.route('/:id')
    .get(publishersController.getPublisherById)
    .delete(publishersController.deletePublisher)
    .put(publishersController.updatePublisher);

module.exports = router;