const express = require('express');
const router = express.Router();
const developersController = require('../../controllers/developersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(developersController.getAllDevelopers)
    .post(developersController.addDeveloper)

router.route('/:id')
    .get(developersController.getDeveloperById)
    .delete(developersController.deleteDeveloper)
    .put(developersController.updateDeveloper);

module.exports = router;