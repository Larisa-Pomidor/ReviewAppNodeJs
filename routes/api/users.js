const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(usersController.getAllUsers)
    .put(usersController.updateUser)

router.route('/profile')
    .get(usersController.getUserInfo)

router.route('/:username')
    .get(usersController.getUser)

router.route('/ban/:username')
    .put(usersController.banUser);

module.exports = router;