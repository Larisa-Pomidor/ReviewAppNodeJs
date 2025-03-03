const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin), usersController.getAllUsers)
    .put(verifyRoles(ROLES_LIST.User), usersController.updateUser)

router.route('/profile')
    .get(verifyRoles(ROLES_LIST.User), usersController.getUserInfo)

router.route('/:id')
    .get(verifyRoles(ROLES_LIST.Admin), usersController.getUser)
    .put(verifyRoles(ROLES_LIST.Admin), usersController.banUser);

module.exports = router;