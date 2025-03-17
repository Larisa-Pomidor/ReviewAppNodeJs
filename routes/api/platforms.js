const express = require('express');
const router = express.Router();
const platformsController = require('../../controllers/platformsController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(platformsController.getAllPlatforms)

module.exports = router;