const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const verifyJWT = require('../../middleware/verifyJWT');

router.route('/')
    .get(usersController.getAllUsers)
    .put(usersController.updateUser)

router.route('/profile')
    .get(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        usersController.getUserInfo)

router.route('/:username')
    .get(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        usersController.getUser)

router.route('/ban/:username')
    .put(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        usersController.banUser);

module.exports = router;